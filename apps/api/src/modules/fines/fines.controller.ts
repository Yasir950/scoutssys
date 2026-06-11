import { Request, Response, NextFunction } from 'express';
import { FinesService } from './fines.service';
import { PayFineSchema } from '@scouts/shared';
import { ApiResponse } from '../../utils/ApiResponse';

export class FinesController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query['page']) || 1;
      const limit = Number(req.query['limit']) || 20;
      const status = req.query['status'] as string | undefined;
      const { fines, total } = await FinesService.getAll(page, limit, status);
      ApiResponse.success(res, fines, 'Fines retrieved', 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fine = await FinesService.getById(req.params['id']!);
      ApiResponse.success(res, fine, 'Fine retrieved');
    } catch (err) { next(err); }
  }

  static async pay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = PayFineSchema.parse(req.body);
      const fine = await FinesService.pay(req.params['id']!, data);
      ApiResponse.success(res, fine, 'Fine marked as paid');
    } catch (err) { next(err); }
  }

  static async waive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notes } = req.body as { notes?: string };
      const fine = await FinesService.waive(req.params['id']!, req.user!.sub, notes);
      ApiResponse.success(res, fine, 'Fine waived');
    } catch (err) { next(err); }
  }
}
