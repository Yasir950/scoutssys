import { DutiesRepository } from './duties.repository';
import { AssignDutyInput, CreateDutyDepartmentInput } from '@scouts/shared';
import { AppError } from '../../utils/AppError';
import { prisma } from '../../lib/prisma';

export class DutiesService {
  static async getDepartments() {
    return DutiesRepository.findAllDepartments();
  }

  static async createDepartment(data: CreateDutyDepartmentInput) {
    return DutiesRepository.createDepartment(data);
  }

  static async getAssignments(page: number, limit: number, departmentId?: string) {
    return DutiesRepository.findAllAssignments(page, limit, departmentId);
  }

  static async assign(data: AssignDutyInput, assignedBy: string) {
    // Look up scout by registration number
    const scout = await prisma.scout.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });
    if (!scout) {
      throw new AppError(
        `Scout with registration number "${data.registrationNumber}" not found`,
        404,
        'NOT_FOUND'
      );
    }

    const { registrationNumber, ...rest } = data;
    return DutiesRepository.assign({ ...rest, scoutId: scout.id, assignedBy });
  }

  static async getAssignmentById(id: string) {
    const assignment = await DutiesRepository.findAssignmentById(id);
    if (!assignment) throw new AppError('Duty assignment not found', 404, 'NOT_FOUND');
    return assignment;
  }
}