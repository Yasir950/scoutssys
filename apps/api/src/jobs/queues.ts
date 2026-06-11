import { Queue } from 'bullmq';
import { bullmqRedis } from '../lib/redis';
import { BULLMQ_QUEUES } from '../utils/constants';

export const pdfQueue = new Queue(BULLMQ_QUEUES.PDF_GENERATION, { connection: bullmqRedis });
export const reportQueue = new Queue(BULLMQ_QUEUES.REPORT_EXPORT, { connection: bullmqRedis });
