import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './lib/env';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { scoutsRouter } from './modules/scouts/scouts.router';
import { dutiesRouter } from './modules/duties/duties.router';
import { inventoryRouter } from './modules/inventory/inventory.router';
import { issueRouter } from './modules/issue/issue.router';
import { returnsRouter } from './modules/returns/returns.router';
import { finesRouter } from './modules/fines/fines.router';
import { exchangeRouter } from './modules/exchange/exchange.router';
import { reportsRouter } from './modules/reports/reports.router';
import { settingsRouter } from './modules/settings/settings.router';
import { guarantorsRouter } from './modules/guarantors/guarantors.router';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => o === origin || o === origin + '/')) {
      callback(null, origin ?? allowedOrigins[0]);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
    skip: (req) => req.path === '/api/health',
  }));

  app.use('/api/', globalRateLimiter);

  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await redis.ping();
      res.json({ success: true, data: { db: 'ok', redis: 'ok', uptime: process.uptime() } });
    } catch (err) {
      res.status(503).json({ success: false, data: { error: String(err) } });
    }
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/scouts', scoutsRouter);
  app.use('/api/v1/duties', dutiesRouter);
  app.use('/api/v1/inventory', inventoryRouter);
  app.use('/api/v1/issue', issueRouter);
  app.use('/api/v1/returns', returnsRouter);
  app.use('/api/v1/fines', finesRouter);
  app.use('/api/v1/exchange', exchangeRouter);
  app.use('/api/v1/reports', reportsRouter);
  app.use('/api/v1/settings', settingsRouter);
  app.use('/api/v1/guarantors', guarantorsRouter);

  app.use(errorHandler);

  return app;
}
