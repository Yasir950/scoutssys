export const REGISTRATION_NUMBER_PREFIX = 'SDMS';
export const GUARANTOR_REQUIRED_THRESHOLD = 500;
export const BCRYPT_SALT_ROUNDS = 12;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const LOGIN_RATE_LIMIT_MAX = 5;
export const LOW_STOCK_THRESHOLD = 10;
export const BULLMQ_QUEUES = {
  PDF_GENERATION: 'pdf-generation',
  REPORT_EXPORT: 'report-export',
} as const;
