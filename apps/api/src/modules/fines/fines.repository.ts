import { prisma } from '../../lib/prisma';
import { PayFineInput } from '@scouts/shared';

export class FinesRepository {
  static async findAll(page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as 'PENDING' | 'PAID' | 'WAIVED' } : {};
    const [fines, total] = await prisma.$transaction([
      prisma.fine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { scout: { select: { fullName: true, registrationNumber: true } }, issuedItem: { include: { inventoryItem: true } } },
      }),
      prisma.fine.count({ where }),
    ]);
    return { fines, total };
  }

  static async findById(id: string) {
    return prisma.fine.findUnique({ where: { id }, include: { scout: true, issuedItem: { include: { inventoryItem: true } } } });
  }

  static async pay(id: string, data: PayFineInput) {
    return prisma.fine.update({
      where: { id },
      data: { status: 'PAID', paymentMethod: data.paymentMethod, paidAt: new Date(), notes: data.notes },
    });
  }

  static async waive(id: string, waivedBy: string, notes?: string) {
    return prisma.fine.update({
      where: { id },
      data: { status: 'WAIVED', waivedBy, notes },
    });
  }

  static async totalByStatus() {
    return prisma.fine.groupBy({ by: ['status'], _sum: { fineAmount: true }, _count: { id: true } });
  }
}
