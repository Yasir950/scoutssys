import { prisma } from '../../lib/prisma';
import { CreateScoutInput } from '@scouts/shared';

export class ScoutsRepository {
  static async findAll(page: number, limit: number, search?: string, city?: string, unitName?: string) {
    const skip = (page - 1) * limit;
    const where = {
      AND: [
        search ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { registrationNumber: { contains: search, mode: 'insensitive' as const } },
            { contactNumber: { contains: search } },
            { cnicOrBForm: { contains: search } },
          ],
        } : {},
        city ? { city: { equals: city, mode: 'insensitive' as const } } : {},
        unitName ? { unitName: { contains: unitName, mode: 'insensitive' as const } } : {},
      ],
    };

    const [scouts, total] = await prisma.$transaction([
      prisma.scout.findMany({ where, skip, take: limit, orderBy: { registeredAt: 'desc' } }),
      prisma.scout.count({ where }),
    ]);

    return { scouts, total };
  }

  static async findById(id: string) {
    return prisma.scout.findUnique({
      where: { id },
      include: {
        dutyAssignments: { include: { department: true } },
        issuedItems: { include: { inventoryItem: { include: { category: true } }, fine: true } },
        fines: true,
      },
    });
  }

  static async findByRegistrationNumber(registrationNumber: string) {
    return prisma.scout.findUnique({ where: { registrationNumber } });
  }

  static async findByCnic(cnicOrBForm: string) {
    return prisma.scout.findFirst({ where: { cnicOrBForm } });
  }

  static async create(data: CreateScoutInput & { registrationNumber: string; registeredBy: string; photoPath?: string }) {
    const { photoBase64: _photoBase64, ...rest } = data;
    return prisma.scout.create({ data: rest });
  }

  static async update(id: string, data: Partial<CreateScoutInput> & { photoPath?: string }) {
    const { photoBase64: _photoBase64, ...rest } = data;
    return prisma.scout.update({ where: { id }, data: rest });
  }

  static async getNextSequence(year: number): Promise<number> {
    const count = await prisma.scout.count({
      where: { registrationNumber: { startsWith: `SDMS-${year}-` } },
    });
    return count + 1;
  }
}
