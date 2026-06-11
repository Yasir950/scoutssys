import { prisma } from '../../lib/prisma';
import { ExchangeItemInput } from '@scouts/shared';
import { AppError } from '../../utils/AppError';
import { redis, CACHE_KEYS } from '../../lib/redis';

export class ExchangeService {
  static async exchange(data: ExchangeItemInput, processedBy: string) {
    const issuedItem = await prisma.issuedItem.findUnique({
      where: { id: data.oldIssuedItemId },
      include: { inventoryItem: true },
    });
    if (!issuedItem) throw new AppError('Issued item not found', 404, 'NOT_FOUND');
    if (issuedItem.returnedAt) throw new AppError('Item has already been returned', 400, 'ALREADY_RETURNED');

    const newItem = await prisma.inventoryItem.findUnique({ where: { tagNumber: data.newTagNumber } });
    if (!newItem) throw new AppError(`Item with tag ${data.newTagNumber} not found`, 404, 'NOT_FOUND');
    if (newItem.status !== 'AVAILABLE') throw new AppError(`Item ${data.newTagNumber} is not available`, 400, 'ITEM_NOT_AVAILABLE');

    const result = await prisma.$transaction(async (tx) => {
      await tx.inventoryItem.update({ where: { id: issuedItem.inventoryItemId }, data: { status: 'DAMAGED', condition: 'DAMAGED' } });
      await tx.inventoryItem.update({ where: { id: newItem.id }, data: { status: 'ISSUED' } });

      const newIssuedItem = await tx.issuedItem.create({
        data: { scoutId: issuedItem.scoutId, inventoryItemId: newItem.id, issuedBy: processedBy, guarantorId: issuedItem.guarantorId },
      });

      await tx.issuedItem.update({ where: { id: data.oldIssuedItemId }, data: { returnedAt: new Date(), returnCondition: 'DAMAGED' } });

      const exchange = await tx.exchangeRecord.create({
        data: { issuedItemId: newIssuedItem.id, oldItemId: issuedItem.inventoryItemId, newItemId: newItem.id, reason: data.reason, notes: data.notes, processedBy },
      });

      return { exchange, newIssuedItem };
    });

    await redis.del(CACHE_KEYS.inventoryTag(issuedItem.inventoryItem.tagNumber));
    await redis.del(CACHE_KEYS.inventoryTag(newItem.tagNumber));

    return result;
  }

  static async getAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [exchanges, total] = await prisma.$transaction([
      prisma.exchangeRecord.findMany({
        skip,
        take: limit,
        orderBy: { exchangedAt: 'desc' },
        include: { oldItem: true, newItem: true, issuedItem: { include: { scout: true } } },
      }),
      prisma.exchangeRecord.count(),
    ]);
    return { exchanges, total };
  }
}
