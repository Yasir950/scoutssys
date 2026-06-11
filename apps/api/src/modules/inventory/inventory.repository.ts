import { prisma } from '../../lib/prisma';
import { CreateInventoryItemInput, UpdateInventoryItemInput, InventoryFilterInput } from '@scouts/shared';

export class InventoryRepository {
  static async findAll(filter: InventoryFilterInput) {
    const { page, limit, categoryId, status, condition, cabinShelfId, search } = filter;
    const skip = (page - 1) * limit;
    const where = {
      AND: [
        categoryId ? { categoryId } : {},
        status ? { status } : {},
        condition ? { condition } : {},
        cabinShelfId ? { cabinShelfId } : {},
        search ? {
          OR: [
            { tagNumber: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        } : {},
      ],
    };

    const [items, total] = await prisma.$transaction([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true, cabinShelf: true },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return { items, total };
  }

  static async findById(id: string) {
    return prisma.inventoryItem.findUnique({
      where: { id },
      include: { category: true, cabinShelf: true, issuedItems: { include: { scout: true } } },
    });
  }

  static async findByTag(tagNumber: string) {
    return prisma.inventoryItem.findUnique({
      where: { tagNumber },
      include: { category: true, cabinShelf: true },
    });
  }

  static async findByCabin(cabinShelfId: string) {
    return prisma.inventoryItem.findMany({
      where: { cabinShelfId },
      include: { category: true },
    });
  }

  static async create(data: CreateInventoryItemInput) {
    return prisma.inventoryItem.create({
      data: { ...data, originalPrice: data.originalPrice },
      include: { category: true, cabinShelf: true },
    });
  }

  static async update(id: string, data: UpdateInventoryItemInput) {
    return prisma.inventoryItem.update({
      where: { id },
      data,
      include: { category: true, cabinShelf: true },
    });
  }

  static async findAllCategories() {
    return prisma.inventoryCategory.findMany({ orderBy: { name: 'asc' } });
  }

  static async findAllCabins() {
    return prisma.cabinShelf.findMany({ orderBy: [{ cabinNumber: 'asc' }, { shelfLabel: 'asc' }] });
  }

  static async createCategory(name: string, description?: string) {
    return prisma.inventoryCategory.create({ data: { name, description } });
  }

  static async createCabinShelf(cabinNumber: string, shelfLabel: string, description?: string) {
    return prisma.cabinShelf.create({ data: { cabinNumber, shelfLabel, description } });
  }

  static async countByStatus() {
    return prisma.inventoryItem.groupBy({ by: ['status'], _count: { id: true } });
  }

  static async countAvailableByCategory() {
    return prisma.inventoryItem.groupBy({
      by: ['categoryId'],
      where: { status: 'AVAILABLE' },
      _count: { id: true },
    });
  }
}
