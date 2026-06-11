import { prisma } from '../../lib/prisma';

export class SettingsService {
  static async getAll() {
    return prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
  }

  static async get(key: string) {
    return prisma.systemConfig.findUnique({ where: { key } });
  }

  static async set(key: string, value: string, updatedBy: string) {
    return prisma.systemConfig.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { key, value, updatedBy },
    });
  }

  static async setBulk(entries: Array<{ key: string; value: string }>, updatedBy: string) {
    return Promise.all(entries.map(({ key, value }) => SettingsService.set(key, value, updatedBy)));
  }
}
