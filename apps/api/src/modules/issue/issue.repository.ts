import { prisma } from '../../lib/prisma';

export class IssueRepository {
  static async findIssuedByScout(scoutId: string) {
    return prisma.issuedItem.findMany({
      where: { scoutId, returnedAt: null },
      include: { inventoryItem: { include: { category: true } }, guarantor: true, fine: true },
    });
  }

  static async findById(id: string) {
    return prisma.issuedItem.findUnique({
      where: { id },
      include: { inventoryItem: true, scout: true, guarantor: true },
    });
  }

  static async createBatch(
    scoutId: string,
    itemIds: string[],
    issuedBy: string,
    guarantorData?: { fullName: string; contactNumber: string; cnicNumber: string; depositedItemDescription: string }
  ) {
    return prisma.$transaction(async (tx) => {
      let guarantorId: string | undefined;
      if (guarantorData) {
        const guarantor = await tx.guarantor.create({ data: guarantorData });
        guarantorId = guarantor.id;
      }

      const issuedItems = await Promise.all(
        itemIds.map((inventoryItemId) =>
          tx.issuedItem.create({
            data: { scoutId, inventoryItemId, issuedBy, guarantorId },
            include: { inventoryItem: true },
          })
        )
      );

      await tx.inventoryItem.updateMany({
        where: { id: { in: itemIds } },
        data: { status: 'ISSUED' },
      });

      return issuedItems;
    });
  }
}
