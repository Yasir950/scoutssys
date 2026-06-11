import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../lib/redis';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, LOGIN_RATE_LIMIT_MAX } from '../utils/constants';

export const globalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    prefix: 'rl:global:',
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' } },
});

export const loginRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    prefix: 'rl:login:',
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  keyGenerator: (req) => `${req.ip}`,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many login attempts, please wait 1 minute' } },
});
