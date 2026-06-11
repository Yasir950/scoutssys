import { prisma } from '../../lib/prisma';
import { AssignDutyInput, CreateDutyDepartmentInput } from '@scouts/shared';
import { AppError } from '../../utils/AppError';

export class DutiesRepository {
  static async findAllDepartments() {
    return prisma.dutyDepartment.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  static async createDepartment(data: CreateDutyDepartmentInput) {
    return prisma.dutyDepartment.create({ data });
  }

  static async findAllAssignments(page: number, limit: number, departmentId?: string) {
    const skip = (page - 1) * limit;
    const where = departmentId ? { departmentId } : {};
    const [assignments, total] = await prisma.$transaction([
      prisma.dutyAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assignedAt: 'desc' },
        include: { scout: true, department: true },
      }),
      prisma.dutyAssignment.count({ where }),
    ]);
    return { assignments, total };
  }

  static async assign(data: Omit<AssignDutyInput, 'registrationNumber'> & { scoutId: string; assignedBy: string }) {
    return prisma.dutyAssignment.create({
      data,
      include: { scout: true, department: true },
    });
  }

  static async findAssignmentById(id: string) {
    return prisma.dutyAssignment.findUnique({
      where: { id },
      include: { scout: true, department: true },
    });
  }
}