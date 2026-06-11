import '../lib/env';
import { Worker } from 'bullmq';
import { redis, bullmqRedis } from '../lib/redis';
import { logger } from '../lib/logger';
import { BULLMQ_QUEUES } from '../utils/constants';

async function startWorker() {
  if (redis.status === 'wait') await redis.connect();

  const pdfWorker = new Worker(
    BULLMQ_QUEUES.PDF_GENERATION,
    async (job) => {
      logger.info('Processing PDF job', { jobId: job.id, data: job.data });
    },
    { connection: bullmqRedis }
  );

  const reportWorker = new Worker(
    BULLMQ_QUEUES.REPORT_EXPORT,
    async (job) => {
      logger.info('Processing report export job', { jobId: job.id, data: job.data });
    },
    { connection: bullmqRedis }
  );

  pdfWorker.on('completed', (job) => logger.info('PDF job completed', { jobId: job.id }));
  pdfWorker.on('failed', (job, err) => logger.error('PDF job failed', { jobId: job?.id, err }));
  reportWorker.on('completed', (job) => logger.info('Report job completed', { jobId: job.id }));
  reportWorker.on('failed', (job, err) => logger.error('Report job failed', { jobId: job?.id, err }));

  logger.info('BullMQ worker started');
}

startWorker().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
