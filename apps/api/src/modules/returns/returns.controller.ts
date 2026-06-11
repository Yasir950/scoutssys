import { Request, Response, NextFunction } from 'express';
import { ReturnsService } from './returns.service';
import { BatchReturnSchema } from '@scouts/shared';
import { ApiResponse } from '../../utils/ApiResponse';

export class ReturnsController {
  /** @route POST /api/v1/returns @access ADMIN, OPERATOR_INVENTORY */
  static async processReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = BatchReturnSchema.parse(req.body);
      const results = await ReturnsService.processBatchReturn(data, req.user!.sub);
      ApiResponse.success(res, results, 'Returns processed successfully');
    } catch (err) { next(err); }
  }

  /** @route GET /api/v1/returns/:scoutId @access All authenticated */
  static async getByScout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await ReturnsService.getByScout(req.params['scoutId']!);
      ApiResponse.success(res, items, 'Scout item history retrieved');
    } catch (err) { next(err); }
  }
}
