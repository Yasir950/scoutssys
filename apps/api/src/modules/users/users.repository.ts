import { prisma } from '../../lib/prisma';
import { CreateUserInput, UpdateUserInput } from '@scouts/shared';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../utils/constants';

export class UsersRepository {
  static async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true } }),
      prisma.user.count(),
    ]);
    return { users, total };
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true } });
  }

  static async create(data: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    return prisma.user.create({
      data: { name: data.name, email: data.email, password: hashedPassword, role: data.role },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
  }

  static async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
    });
  }
}
