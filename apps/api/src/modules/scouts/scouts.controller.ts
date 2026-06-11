import { Request, Response, NextFunction } from 'express';
import { ScoutsService } from './scouts.service';
import { CreateScoutSchema, UpdateScoutSchema, ScoutSearchSchema } from '@scouts/shared';
import { ApiResponse } from '../../utils/ApiResponse';

export class ScoutsController {
  /** @route GET /api/v1/scouts @access ADMIN, OPERATOR_REGISTRATION, VIEWER */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, city, unitName } = ScoutSearchSchema.parse(req.query);
      const { scouts, total } = await ScoutsService.getAll(page, limit, search, city, unitName);
      ApiResponse.success(res, scouts, 'Scouts retrieved', 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
  }

  /** @route GET /api/v1/scouts/:id @access ADMIN, OPERATOR_REGISTRATION, VIEWER */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scout = await ScoutsService.getById(req.params['id']!);
      ApiResponse.success(res, scout, 'Scout retrieved');
    } catch (err) { next(err); }
  }

  /** @route POST /api/v1/scouts @access ADMIN, OPERATOR_REGISTRATION */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bodyData = { ...req.body };
      if (bodyData.age) bodyData.age = Number(bodyData.age);
      if (bodyData.hasPreviousExperience) bodyData.hasPreviousExperience = bodyData.hasPreviousExperience === 'true';
      const data = CreateScoutSchema.parse(bodyData);
      const scout = await ScoutsService.create(data, req.user!.sub, req.file);
      ApiResponse.created(res, scout, 'Scout registered successfully');
    } catch (err) { next(err); }
  }

  /** @route PUT /api/v1/scouts/:id @access ADMIN, OPERATOR_REGISTRATION */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateScoutSchema.parse(req.body);
      const scout = await ScoutsService.update(req.params['id']!, data, req.file);
      ApiResponse.success(res, scout, 'Scout updated');
    } catch (err) { next(err); }
  }
}
