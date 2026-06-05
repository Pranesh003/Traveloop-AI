import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { emailService } from '../services/email.service';
import logger from '../utils/logger';

export interface EmailJobData {
  type: 'verification' | 'password-reset' | 'welcome' | 'budget-alert' | 'custom';
  to: string;
  name: string;
  token?: string;
  tripName?: string;
  percentUsed?: number;
  subject?: string;
  html?: string;
}

let emailQueue: Queue<EmailJobData> | null = null;
let emailWorker: Worker<EmailJobData> | null = null;

export function initEmailQueue(): void {
  const redis = getRedisClient();
  if (!redis || (redis as any).isMock) {
    logger.warn('⚠️  Email queue running in direct fallback mode (Redis mock active)');
    return;
  }

  const connection = {
    host: redis.options.host as string,
    port: redis.options.port as number,
    password: redis.options.password as string | undefined,
  };

  emailQueue = new Queue<EmailJobData>('email', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  });

  emailWorker = new Worker<EmailJobData>(
    'email',
    async (job: Job<EmailJobData>) => {
      const { type, to, name, token, tripName, percentUsed, subject, html } = job.data;

      switch (type) {
        case 'verification':
          await emailService.sendVerificationEmail(to, name, token!);
          break;
        case 'password-reset':
          await emailService.sendPasswordResetEmail(to, name, token!);
          break;
        case 'welcome':
          await emailService.sendWelcomeEmail(to, name);
          break;
        case 'budget-alert':
          await emailService.sendBudgetAlertEmail(to, name, tripName!, percentUsed!);
          break;
        default:
          break;
      }

      logger.info(`Email job completed: ${type} → ${to}`);
    },
    { connection },
  );

  emailWorker.on('failed', (job, err) => {
    logger.error(`Email job failed (${job?.id}):`, err);
  });

  logger.info('✅ Email queue initialized');
}

export async function enqueueEmail(data: EmailJobData): Promise<void> {
  if (!emailQueue) {
    // Fallback: send directly if queue not available
    try {
      if (data.type === 'verification') await emailService.sendVerificationEmail(data.to, data.name, data.token!);
      if (data.type === 'welcome') await emailService.sendWelcomeEmail(data.to, data.name);
    } catch (err) {
      logger.error('Direct email send failed:', err);
    }
    return;
  }

  await emailQueue.add(data.type, data);
}
