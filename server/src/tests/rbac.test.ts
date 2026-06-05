import request from 'supertest';
import { createApp } from '../app';
import prisma from '../config/database/postgresql/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import './setup'; // Include db setups

const app = createApp();

describe('RBAC Middleware and Authorization Tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Clean up any existing test users to prevent unique constraint errors
    await prisma.user.deleteMany({
      where: {
        email: { in: ['admin@traveloop.ai', 'standard@traveloop.ai'] },
      },
    });

    // 1. Setup Role and Permissions
    const manageUsersPermission = await prisma.permission.upsert({
      where: { name: 'MANAGE_USERS' },
      update: {},
      create: { name: 'MANAGE_USERS', description: 'Manage users', resource: 'users', action: 'manage' },
    });

    const createTripPermission = await prisma.permission.upsert({
      where: { name: 'CREATE_TRIP' },
      update: {},
      create: { name: 'CREATE_TRIP', description: 'Create trip', resource: 'trips', action: 'create' },
    });

    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN', description: 'Admin Role', isSystem: true },
    });

    const userRole = await prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { name: 'USER', description: 'User Role', isSystem: false },
    });

    // Assign permissions to roles
    await prisma.rolePermission.deleteMany({});
    await prisma.rolePermission.createMany({
      data: [
        { roleId: adminRole.id, permissionId: manageUsersPermission.id },
        { roleId: userRole.id, permissionId: createTripPermission.id },
      ],
    });

    // Create Admin User
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@traveloop.ai',
        status: 'ACTIVE',
        isEmailVerified: true,
        roleId: adminRole.id,
      },
    });

    // Create Standard User
    const standardUser = await prisma.user.create({
      data: {
        name: 'Standard User',
        email: 'standard@traveloop.ai',
        status: 'ACTIVE',
        isEmailVerified: true,
        roleId: userRole.id,
      },
    });

    // Generate tokens
    adminToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, roleId: adminRole.id, roleName: 'ADMIN', permissions: ['MANAGE_USERS'] },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { userId: standardUser.id, email: standardUser.email, roleId: userRole.id, roleName: 'USER', permissions: ['CREATE_TRIP'] },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );
  });

  it('should block users without standard auth headers for protected route', async () => {
    const res = await request(app)
      .get('/api/users'); // Requires MANAGE_USERS or requireAdmin

    expect(res.status).toBe(401);
  });

  it('should block standard user from accessing admin endpoints', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin to access admin endpoints', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
