import mongoose from 'mongoose';
import { env } from '../../env';
import logger from '../../../utils/logger';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export async function connectMongoDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', false);

    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    try {
      logger.info('Connecting to MongoDB...');
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 2000,
        socketTimeoutMS: 45000,
      });
    } catch (err) {
      logger.warn('⚠️ Native MongoDB connection failed, starting MongoMemoryServer fallback...');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      logger.info(`Starting in-memory MongoDB at ${uri}`);
      await mongoose.connect(uri);
    }
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
  logger.info('MongoDB disconnected');
}

export default mongoose;

