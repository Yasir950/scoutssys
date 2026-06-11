import { prisma } from '../../lib/prisma';
import { ReturnItemInput } from '@scouts/shared';
import { Decimal } from '@prisma/client/runtime/library';

export class ReturnsRepository {
  static async processReturn(item: ReturnItemInput, processedBy: string, finePercentage: number) {
    return prisma.$transaction(async (tx) => {
      const issuedItem = await tx.issuedItem.findUnique({
        where: { id: item.issuedItemId },
        include: { inventoryItem: true },
      });
      if (!issuedItem) throw new Error('Issued item not found');

      await tx.issuedItem.update({
        where: { id: item.issuedItemId },
        data: { returnedAt: new Date(), returnCondition: item.condition },
      });

      await tx.returnRecord.create({
        data: { issuedItemId: item.issuedItemId, condition: item.condition, notes: item.notes, processedBy },
      });

      let newStatus: 'AVAILABLE' | 'DAMAGED' | 'LOST' = 'AVAILABLE';
      let fine = null;

      if (item.condition === 'DAMAGED' || item.condition === 'LOST') {
        newStatus = item.condition === 'LOST' ? 'LOST' : 'DAMAGED';
        const originalPrice = issuedItem.inventoryItem.originalPrice as Decimal;
        const fineAmount = Number(originalPrice) * (1 + finePercentage / 100);
        fine = await tx.fine.create({
          data: {
            scoutId: issuedItem.scoutId,
            issuedItemId: item.issuedItemId,
            originalPrice: originalPrice,
            finePercentage: finePercentage,
            fineAmount: fineAmount,
          },
        });
      }

      await tx.inventoryItem.update({
        where: { id: issuedItem.inventoryItemId },
        data: { status: newStatus },
      });

      return { issuedItem, fine };
    });
  }

  static async findByScout(scoutId: string) {
    return prisma.issuedItem.findMany({
      where: { scoutId },
      include: { inventoryItem: { include: { category: true } }, returnRecord: true, fine: true },
    });
  }
}
