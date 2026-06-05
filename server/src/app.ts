import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import hpp from 'hpp';

import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import logger from './utils/logger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import tripRoutes from './modules/trips/trips.routes';
import aiRoutes from './modules/ai/ai.routes';
import destinationRoutes from './modules/destinations/destinations.routes';
import activityRoutes from './modules/activities/activities.routes';
import budgetRoutes from './modules/budgets/budgets.routes';
import communityRoutes from './modules/community/community.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import supportRoutes from './modules/support/support.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import searchRoutes from './modules/search/search.routes';

export function createApp(): Application {
  const app = express();

  // ===== Security Middleware =====
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  }));

  app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // MongoDB injection protection
  app.use(mongoSanitize());

  // ===== General Middleware =====
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: { write: (msg: string) => logger.info(msg.trim()) },
    }));
  }

  // Global rate limiter
  app.use('/api', globalLimiter);

  // ===== Health Check =====
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version ?? '1.0.0',
    });
  });

  // ===== Swagger Documentation =====
  const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Traveloop AI API',
        version: '1.0.0',
        description: 'Production-ready REST API for Traveloop AI travel planning platform',
        contact: { name: 'Traveloop AI', url: 'https://traveloop.ai' },
      },
      servers: [
        { url: `http://localhost:${env.PORT}/api`, description: 'Development' },
        { url: 'https://api.traveloop.ai/api', description: 'Production' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ BearerAuth: [] }],
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { background: linear-gradient(135deg, #6366f1, #8b5cf6); }',
    customSiteTitle: 'Traveloop AI — API Docs',
  }));

  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.json(swaggerSpec);
  });

  // ===== API Routes =====
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/destinations', destinationRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/budgets', budgetRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api', searchRoutes); // packages, bookings, roles, permissions, journals, search

  // ===== 404 Handler =====
  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    next(AppError.notFound(`Route: ${req.originalUrl}`));
  });

  // ===== Global Error Handler =====
  app.use(errorHandler);

  return app;
}
