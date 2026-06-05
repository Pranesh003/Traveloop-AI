import prisma from '../../config/database/postgresql/prisma';
import { AppError } from '../../utils/AppError';
import { cloudinaryService } from '../../services/cloudinary.service';
import { getPagination } from '../../utils/pagination';

const userSelect = {
  id: true, name: true, email: true, avatar: true, bio: true, phone: true,
  country: true, timezone: true, isEmailVerified: true, status: true,
  lastLoginAt: true, createdAt: true, updatedAt: true,
  role: { select: { id: true, name: true } },
  subscriptions: { select: { plan: true, status: true }, orderBy: { createdAt: 'desc' as const }, take: 1 },
};

export const usersService = {
  async getMyProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
    if (!user) throw AppError.notFound('User');
    return user;
  },

  async updateMyProfile(userId: string, data: Record<string, any>) {
    const { plan, ...rest } = data;
    if (plan) {
      let cleanPlan = String(plan).toUpperCase();
      if (cleanPlan === 'PRO') cleanPlan = 'ENTERPRISE';
      await prisma.subscription.create({
        data: {
          userId,
          plan: cleanPlan as any,
          status: 'ACTIVE',
        }
      });
    }
    return prisma.user.update({
      where: { id: userId },
      data: rest,
      select: userSelect,
    });
  },

  async uploadAvatar(userId: string, buffer: Buffer) {
    const result = await cloudinaryService.uploadBuffer(buffer, 'traveloop/avatars', {
      public_id: `avatar_${userId}`,
      overwrite: true,
      width: 400,
      height: 400,
      crop: 'fill',
    });

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: result.secureUrl },
    });

    return result.secureUrl;
  },

  async getAllUsers(page: number, limit: number, filters: Record<string, string>) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.roleId) where.roleId = filters.roleId;

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  async searchUsers(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, skip, take: limit }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw AppError.notFound('User');
    return user;
  },

  async updateUser(id: string, data: Record<string, any>) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User');
    
    const { plan, ...rest } = data;
    if (plan) {
      let cleanPlan = String(plan).toUpperCase();
      if (cleanPlan === 'PRO') cleanPlan = 'ENTERPRISE';
      await prisma.subscription.create({
        data: {
          userId: id,
          plan: cleanPlan as any,
          status: 'ACTIVE',
        }
      });
    }
    return prisma.user.update({ where: { id }, data: rest, select: userSelect });
  },

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User');
    await prisma.user.delete({ where: { id } });
  },

  async updateStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User');
    return prisma.user.update({ where: { id }, data: { status }, select: userSelect });
  },

  async assignRole(userId: string, roleId: string) {
    const [user, role] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.role.findUnique({ where: { id: roleId } }),
    ]);
    if (!user) throw AppError.notFound('User');
    if (!role) throw AppError.notFound('Role');
    return prisma.user.update({ where: { id: userId }, data: { roleId }, select: userSelect });
  },

  async deleteMyAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  },
};
