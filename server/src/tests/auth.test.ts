import request from 'supertest';
import { createApp } from '../app';
import prisma from '../config/database/postgresql/prisma';
import './setup'; // Include db setups

const app = createApp();

describe('Auth Module Integration Tests', () => {
  let roleId: string;

  beforeAll(async () => {
    // Clean up any existing test user to prevent unique constraint errors
    await prisma.user.deleteMany({
      where: {
        email: 'jane@traveloop.ai',
      },
    });

    // Make sure 'USER' role exists
    const role = await prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { name: 'USER', description: 'Standard User', isSystem: false },
    });
    roleId = role.id;
  });

  const testUser = {
    name: 'Jane Doe',
    email: 'jane@traveloop.ai',
    password: 'Password123!',
  };

  it('should sign up a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('should not allow signup with an existing email', async () => {
    // User already exists in DB from previous test if using same email
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.status).toBe(409); // Conflict
  });

  it('should log in a user and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('should retrieve current user details with access token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const accessToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('should fail access with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer invalidtoken`);

    expect(res.status).toBe(401);
  });
});
