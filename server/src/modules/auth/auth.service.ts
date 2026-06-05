import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../config/database/postgresql/prisma';
import { AppError } from '../../utils/AppError';
import { tokenService } from '../../services/token.service';
import { enqueueEmail } from '../../queues/email.queue';
import { env } from '../../config/env';
import { SignupInput, LoginInput } from './auth.validation';

export const authService = {
  async signup(data: SignupInput) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw AppError.conflict('Email already registered');

    // Get default USER role
    const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) throw AppError.internal('Default role not found. Run seed first.');

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        roleId: userRole.id,
        emailVerifyToken,
        emailVerifyExpires,
      },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });

    // Send verification email (async via queue)
    await enqueueEmail({
      type: 'verification',
      to: user.email,
      name: user.name,
      token: emailVerifyToken,
    });

    // Create default free subscription
    await prisma.subscription.create({
      data: { userId: user.id, plan: 'FREE', status: 'ACTIVE' },
    });

    // Generate tokens
    const permissions = user.role.permissions.map(rp => rp.permission.name);
    const tokens = tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions,
    });

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken, lastLoginAt: new Date() },
    });

    return {
      tokens,
      user: formatUser(user),
    };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Check account lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw AppError.unauthorized(`Account locked. Try again in ${minutes} minutes.`);
    }

    // Check password
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      const attempts = user.loginAttempts + 1;
      const lockUntil = attempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts, lockUntil },
      });

      throw AppError.unauthorized('Invalid email or password');
    }

    // Check status
    if (user.status === 'BANNED') throw AppError.forbidden('Account has been banned');
    if (user.status === 'SUSPENDED') throw AppError.forbidden('Account is temporarily suspended');

    // Generate tokens
    const permissions = user.role.permissions.map(rp => rp.permission.name);
    const tokens = tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions,
    });

    // Reset login attempts, save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
        refreshToken: tokens.refreshToken,
        lastLoginAt: new Date(),
      },
    });

    return {
      tokens,
      user: formatUser(user),
    };
  },

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  },

  async refreshTokens(refreshToken: string) {
    try {
      const { userId } = tokenService.verifyRefresh(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw AppError.unauthorized('Invalid refresh token');
      }

      if (user.status !== 'ACTIVE') {
        throw AppError.forbidden('Account is not active');
      }

      const permissions = user.role.permissions.map(rp => rp.permission.name);
      const tokens = tokenService.generateTokens({
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        permissions,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return { tokens, user: formatUser(user) };
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success (don't reveal if email exists)
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    await enqueueEmail({
      type: 'password-reset',
      to: user.email,
      name: user.name,
      token,
    });
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) throw AppError.badRequest('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: null,
        loginAttempts: 0,
        lockUntil: null,
      },
    });
  },

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() },
      },
    });

    if (!user) throw AppError.badRequest('Invalid or expired verification token');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    // Send welcome email
    await enqueueEmail({ type: 'welcome', to: user.email, name: user.name });
  },

  async googleCallback(googleId: string, email: string, name: string, avatar?: string) {
    // Find or create user
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    if (!user) {
      const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
      if (!userRole) throw AppError.internal('Default role not found');

      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name,
          avatar,
          isEmailVerified: true,
          roleId: userRole.id,
        },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });

      await prisma.subscription.create({
        data: { userId: user.id, plan: 'FREE', status: 'ACTIVE' },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: avatar || user.avatar },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });
    }

    const permissions = user.role.permissions.map((rp: any) => rp.permission.name);
    const tokens = tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken, lastLoginAt: new Date() },
    });

    return { tokens, user: formatUser(user) };
  },
};

function formatUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    isEmailVerified: user.isEmailVerified,
    role: user.role?.name,
    permissions: user.role?.permissions?.map((rp: any) => rp.permission?.name) ?? [],
    createdAt: user.createdAt,
  };
}
