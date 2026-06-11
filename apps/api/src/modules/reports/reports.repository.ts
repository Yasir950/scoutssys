import { prisma } from '../../lib/prisma';

export class ReportsRepository {
  static async getScoutRegistrations(startDate?: Date, endDate?: Date) {
    return prisma.scout.findMany({
      where: {
        registeredAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
      orderBy: { registeredAt: 'desc' },
    });
  }

  static async getIssuedItems(startDate?: Date, endDate?: Date) {
    return prisma.issuedItem.findMany({
      where: {
        issuedAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
      include: { scout: true, inventoryItem: { include: { category: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  static async getPendingReturns() {
    return prisma.issuedItem.findMany({
      where: { returnedAt: null },
      include: { scout: true, inventoryItem: { include: { category: true } }, guarantor: true },
      orderBy: { issuedAt: 'asc' },
    });
  }

  static async getFines(status?: 'PENDING' | 'PAID' | 'WAIVED') {
    return prisma.fine.findMany({
      where: status ? { status } : {},
      include: { scout: true, issuedItem: { include: { inventoryItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getInventoryByCategory() {
    return prisma.inventoryItem.findMany({
      include: { category: true, cabinShelf: true },
      orderBy: [{ categoryId: 'asc' }, { tagNumber: 'asc' }],
    });
  }

  static async getItemsByCondition() {
    return prisma.inventoryItem.groupBy({ by: ['condition', 'status'], _count: { id: true } });
  }

  static async getCabinInventory() {
    return prisma.cabinShelf.findMany({
      include: {
        items: { include: { category: true }, orderBy: { tagNumber: 'asc' } },
      },
      orderBy: [{ cabinNumber: 'asc' }, { shelfLabel: 'asc' }],
    });
  }

  static async getScoutHistory(scoutId: string) {
    return prisma.scout.findUnique({
      where: { id: scoutId },
      include: {
        dutyAssignments: { include: { department: true } },
        issuedItems: { include: { inventoryItem: { include: { category: true } }, returnRecord: true, fine: true, exchange: true } },
        fines: true,
      },
    });
  }

  static async getDailyActivity(date?: Date) {
    const targetDate = date ?? new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [registrations, issues, returns] = await Promise.all([
      prisma.scout.count({ where: { registeredAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.issuedItem.count({ where: { issuedAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.issuedItem.count({ where: { returnedAt: { gte: startOfDay, lte: endOfDay } } }),
    ]);

    return { date: targetDate, registrations, issues, returns };
  }

  static async getDepartmentDutySummary() {
    return prisma.dutyDepartment.findMany({
      include: {
        assignments: { include: { scout: true } },
      },
      where: { isActive: true },
    });
  }

  static async getGuarantors() {
    return prisma.guarantor.findMany({
      include: { issuedItems: { include: { scout: true, inventoryItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getExchangeHistory() {
    return prisma.exchangeRecord.findMany({
      include: { oldItem: true, newItem: true, issuedItem: { include: { scout: true } } },
      orderBy: { exchangedAt: 'desc' },
    });
  }

  static async getAuditLog(page: number, limit: number, userId?: string) {
    const skip = (page - 1) * limit;
    const where = userId ? { userId } : {};
    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { logs, total };
  }

  static async getDashboardStats() {
    const [totalScouts, itemsIssued, pendingReturns, fineStats] = await Promise.all([
      prisma.scout.count(),
      prisma.issuedItem.count({ where: { returnedAt: null } }),
      prisma.issuedItem.count({ where: { returnedAt: null } }),
      prisma.fine.aggregate({ where: { status: 'PENDING' }, _sum: { fineAmount: true } }),
    ]);

    const recentRegistrations = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE("registeredAt")::text as date, COUNT(*) as count
      FROM scouts
      WHERE "registeredAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("registeredAt")
      ORDER BY date
    `;

    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });

    return {
      totalScouts,
      itemsIssued,
      pendingReturns,
      totalFines: Number(fineStats._sum.fineAmount ?? 0),
      recentRegistrations: recentRegistrations.map((r) => ({ date: r.date, count: Number(r.count) })),
      issuedByDepartment: [],
      recentActivity: recentActivity.map((a) => ({
        type: a.action,
        description: `${a.user.name} performed ${a.action} on ${a.resource}`,
        time: a.createdAt.toISOString(),
      })),
    };
  }
}
