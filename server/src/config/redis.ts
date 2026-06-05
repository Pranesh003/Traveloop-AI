import Redis from 'ioredis';
import { env } from './env';
import logger from '../utils/logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  return redisClient;
}

export async function connectRedis(): Promise<Redis | null> {
  try {
    const client = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        if (times > 1) {
          return null; // Stop retrying quickly in dev
        }
        return 50;
      },
      lazyConnect: true,
    });

    try {
      await client.connect();
      client.on('connect', () => logger.info('✅ Redis connected'));
      client.on('error', (err) => logger.error('Redis error:', err));
      client.on('close', () => logger.warn('Redis connection closed'));
      redisClient = client;
      return client;
    } catch (connectErr) {
      logger.warn('⚠️ Redis connection failed. Starting in-memory Redis mock...');
      const RedisMock = require('ioredis-mock');
      const mockClient = new RedisMock();
      mockClient.isMock = true;
      redisClient = mockClient;
      return mockClient;
    }
  } catch (error) {
    logger.warn('⚠️ Redis not available, starting in-memory Redis mock:', (error as Error).message);
    const RedisMock = require('ioredis-mock');
    const mockClient = new RedisMock();
    mockClient.isMock = true;
    redisClient = mockClient;
    return mockClient;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Cache helper utilities
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redisClient) return null;
    const val = await redisClient.get(key);
    return val ? JSON.parse(val) : null;
  },

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!redisClient) return;
    await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
  },

  async del(key: string): Promise<void> {
    if (!redisClient) return;
    await redisClient.del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    if (!redisClient) return;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) await redisClient.del(...keys);
  },

  buildKey: (...parts: string[]): string => parts.join(':'),
};
