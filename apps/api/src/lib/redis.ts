import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Separate connection for BullMQ — requires maxRetriesPerRequest: null
export const bullmqRedis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { err }));

export const CACHE_KEYS = {
  scoutSearch: (q: string) => `scout:search:${q}`,
  scoutById: (id: string) => `scout:${id}`,
  inventoryTag: (tag: string) => `inventory:tag:${tag}`,
  reportData: (type: string, params: string) => `report:${type}:${params}`,
  jwtBlacklist: (jti: string) => `jwt:blacklist:${jti}`,
  rateLimitPrefix: 'rl:',
} as const;

export const CACHE_TTL = {
  scoutSearch: 30,
  inventoryTag: 300,
  report: 120,
} as const;
