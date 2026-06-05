import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { Notification } from '../config/database/mongodb/models/System';
import { socketService } from '../services/socket.service';
import logger from '../utils/logger';

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
}

let notificationQueue: Queue<NotificationJobData> | null = null;

export function initNotificationQueue(): void {
  const redis = getRedisClient();
  if (!redis || (redis as any).isMock) {
    logger.warn('⚠️  Notification queue running in direct fallback mode (Redis mock active)');
    return;
  }

  const connection = {
    host: redis.options.host as string,
    port: redis.options.port as number,
    password: redis.options.password as string | undefined,
  };

  notificationQueue = new Queue<NotificationJobData>('notifications', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 50,
    },
  });

  const worker = new Worker<NotificationJobData>(
    'notifications',
    async (job: Job<NotificationJobData>) => {
      const { userId, type, title, body, data, actionUrl } = job.data;

      // Save to MongoDB
      const notification = await Notification.create({
        userId,
        type,
        title,
        body,
        data,
        actionUrl,
        isRead: false,
      });

      // Send real-time via Socket.IO
      socketService.sendNotification(userId, {
        id: notification._id.toString(),
        type,
        title,
        body,
        data,
        createdAt: notification.createdAt,
      });

      logger.info(`Notification sent to user ${userId}: ${title}`);
    },
    { connection },
  );

  worker.on('failed', (job, err) => {
    logger.error(`Notification job failed (${job?.id}):`, err);
  });

  logger.info('✅ Notification queue initialized');
}

export async function enqueueNotification(data: NotificationJobData): Promise<void> {
  if (!notificationQueue) {
    // Fallback: create notification directly
    try {
      const notification = await Notification.create({
        ...data,
        isRead: false,
      });
      socketService.sendNotification(data.userId, {
        id: notification._id.toString(),
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data,
        createdAt: notification.createdAt,
      });
    } catch (err) {
      logger.error('Direct notification failed:', err);
    }
    return;
  }

  await notificationQueue.add('send', data);
}
