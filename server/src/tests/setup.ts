import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import prisma from '../config/database/postgresql/prisma';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Clear SMTP values to force email logger fallback
  process.env.SMTP_USER = '';
  process.env.SMTP_PASS = '';

  // Setup MongoMemoryServer
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;

  // Connect Mongoose to the memory server
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);

  // Initialize/check Prisma connection
  await prisma.$connect();
});

afterAll(async () => {
  // Disconnect databases
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  await prisma.$disconnect();
});

beforeAll(async () => {
  // Clean MongoDB collections
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }

  // Clean Postgres database tables safely (keeping roles/permissions/metadata if seeded)
  // Delete transactions/user data
  await prisma.expense.deleteMany().catch(() => {});
  await prisma.budget.deleteMany().catch(() => {});
  await prisma.tripStopActivity.deleteMany().catch(() => {});
  await prisma.tripStop.deleteMany().catch(() => {});
  await prisma.trip.deleteMany().catch(() => {});
  await prisma.booking.deleteMany().catch(() => {});
  await prisma.packageSave.deleteMany().catch(() => {});
  await prisma.packageActivity.deleteMany().catch(() => {});
  await prisma.travelPackage.deleteMany().catch(() => {});
  await prisma.supportTicket.deleteMany().catch(() => {});
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.subscription.deleteMany().catch(() => {});
  // Do not delete users here to preserve the test users created in beforeAll of each test file.
  // They will be cleaned up on next run or afterAll.
});
