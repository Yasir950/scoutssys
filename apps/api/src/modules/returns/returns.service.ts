import { ReturnsRepository } from './returns.repository';
import { BatchReturnInput } from '@scouts/shared';
import { prisma } from '../../lib/prisma';

export class ReturnsService {
  static async processBatchReturn(data: BatchReturnInput, processedBy: string) {
    const configRow = await prisma.systemConfig.findUnique({ where: { key: 'FINE_PERCENTAGE' } });
    const finePercentage = Number(configRow?.value ?? 5);

    const results = await Promise.all(
      data.items.map((item) => ReturnsRepository.processReturn(item, processedBy, finePercentage))
    );

    return results;
  }

  static async getByScout(scoutId: string) {
    return ReturnsRepository.findByScout(scoutId);
  }
}
