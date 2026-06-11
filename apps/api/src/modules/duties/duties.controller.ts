import { Request, Response, NextFunction } from 'express';
import { DutiesService } from './duties.service';
import { AssignDutySchema, CreateDutyDepartmentSchema } from '@scouts/shared';
import { ApiResponse } from '../../utils/ApiResponse';

export class DutiesController {
  /** @route GET /api/v1/duties/departments @access All authenticated */
  static async getDepartments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await DutiesService.getDepartments();
      ApiResponse.success(res, departments, 'Departments retrieved');
    } catch (err) { next(err); }
  }

  /** @route POST /api/v1/duties/departments @access ADMIN */
  static async createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateDutyDepartmentSchema.parse(req.body);
      const dept = await DutiesService.createDepartment(data);
      ApiResponse.created(res, dept, 'Department created');
    } catch (err) { next(err); }
  }

  /** @route GET /api/v1/duties @access All authenticated */
  static async getAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query['page']) || 1;
      const limit = Number(req.query['limit']) || 20;
      const departmentId = req.query['departmentId'] as string | undefined;
      const { assignments, total } = await DutiesService.getAssignments(page, limit, departmentId);
      ApiResponse.success(res, assignments, 'Assignments retrieved', 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
  }

  /** @route POST /api/v1/duties/assign @access ADMIN, OPERATOR_REGISTRATION */
  static async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = AssignDutySchema.parse(req.body);
      const assignment = await DutiesService.assign(data, req.user!.sub);
      ApiResponse.created(res, assignment, 'Duty assigned successfully');
    } catch (err) { next(err); }
  }

  /** @route GET /api/v1/duties/:id @access All authenticated */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await DutiesService.getAssignmentById(req.params['id']!);
      ApiResponse.success(res, assignment, 'Assignment retrieved');
    } catch (err) { next(err); }
  }
}
