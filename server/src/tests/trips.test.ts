import request from 'supertest';
import { createApp } from '../app';
import prisma from '../config/database/postgresql/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import './setup'; // Include db setups

const app = createApp();

describe('Trips Module Integration Tests', () => {
  let userToken: string;
  let userId: string;
  let tripId: string;

  beforeAll(async () => {
    // Clean up any existing test user to prevent unique constraint errors
    await prisma.user.deleteMany({
      where: {
        email: 'standard2@traveloop.ai',
      },
    });

    // Create role
    const userRole = await prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { name: 'USER', description: 'User Role', isSystem: false },
    });

    // Create user
    const standardUser = await prisma.user.create({
      data: {
        name: 'Standard User',
        email: 'standard2@traveloop.ai',
        status: 'ACTIVE',
        isEmailVerified: true,
        roleId: userRole.id,
      },
    });
    userId = standardUser.id;

    // Generate token
    userToken = jwt.sign(
      { userId: standardUser.id, email: standardUser.email, roleId: userRole.id, roleName: 'USER', permissions: ['CREATE_TRIP'] },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );
  });

  it('should create a trip successfully', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Summer Trip 2026',
        description: 'Going to the beaches!',
        visibility: 'PRIVATE',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Summer Trip 2026');
    tripId = res.body.data.id;
  });

  it('should get all trips for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should update trip properties', async () => {
    const res = await request(app)
      .put(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Summer Trip 2026 Updated',
        description: 'Updated description',
        status: 'PLANNED',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Summer Trip 2026 Updated');
  });

  it('should delete a trip successfully', async () => {
    const res = await request(app)
      .delete(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(204);

    // Verify it is deleted or soft-deleted/removed
    const getRes = await request(app)
      .get(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.status).toBe(404);
  });
});
