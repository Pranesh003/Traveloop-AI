import request from 'supertest';
import { createApp } from '../app';
import prisma from '../config/database/postgresql/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import './setup'; // Include db setups

const app = createApp();

describe('Core Modules Integration Tests', () => {
  let userToken: string;
  let adminToken: string;
  let tripId: string;

  beforeAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: {
        email: { in: ['testuser@traveloop.ai', 'testadmin@traveloop.ai'] },
      },
    });

    const userRole = await prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { name: 'USER', description: 'User', isSystem: false },
    });

    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN', description: 'Admin', isSystem: true },
    });

    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@traveloop.ai',
        status: 'ACTIVE',
        isEmailVerified: true,
        roleId: userRole.id,
      },
    });

    const admin = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'testadmin@traveloop.ai',
        status: 'ACTIVE',
        isEmailVerified: true,
        roleId: adminRole.id,
      },
    });

    userToken = jwt.sign(
      { userId: user.id, email: user.email, roleId: userRole.id, roleName: 'USER', permissions: ['CREATE_TRIP'] },
      env.JWT_ACCESS_SECRET
    );

    adminToken = jwt.sign(
      { userId: admin.id, email: admin.email, roleId: adminRole.id, roleName: 'ADMIN', permissions: ['MANAGE_DESTINATIONS', 'MANAGE_ACTIVITIES'] },
      env.JWT_ACCESS_SECRET
    );

    // Create a trip for budget tests
    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        name: 'Europe Tour',
        status: 'PLANNED',
      },
    });
    tripId = trip.id;
  });

  // --- Geography / Destinations ---
  describe('Destinations Endpoints', () => {
    it('should fetch list of countries', async () => {
      const res = await request(app).get('/api/destinations/countries');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should fetch list of cities', async () => {
      const res = await request(app).get('/api/destinations/cities');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should fetch paginated list of destinations', async () => {
      const res = await request(app).get('/api/destinations');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // --- Activities ---
  describe('Activities Endpoints', () => {
    it('should fetch list of activities', async () => {
      const res = await request(app).get('/api/activities');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // --- Budgets ---
  describe('Budgets Endpoints', () => {
    it('should create and retrieve a trip budget', async () => {
      // 1. Create
      const createRes = await request(app)
        .post(`/api/budgets/trips/${tripId}/budget`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          totalAmount: 2000,
          currency: 'EUR',
          alertEnabled: true,
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.totalAmount).toBe(2000);

      // 2. Get
      const getRes = await request(app)
        .get(`/api/budgets/trips/${tripId}/budget`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.totalAmount).toBe(2000);
    });
  });

  // --- AI Conversations ---
  describe('AI Endpoints', () => {
    it('should fetch user AI chat history', async () => {
      const res = await request(app)
        .get('/api/ai/conversations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
