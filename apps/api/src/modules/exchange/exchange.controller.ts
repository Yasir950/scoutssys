import { Request, Response, NextFunction } from 'express';
import { ExchangeService } from './exchange.service';
import { ExchangeItemSchema } from '@scouts/shared';
import { ApiResponse } from '../../utils/ApiResponse';

export class ExchangeController {
  static async exchange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = ExchangeItemSchema.parse(req.body);
      const result = await ExchangeService.exchange(data, req.user!.sub);
      ApiResponse.created(res, result, 'Item exchanged successfully');
    } catch (err) { next(err); }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query['page']) || 1;
      const limit = Number(req.query['limit']) || 20;
      const { exchanges, total } = await ExchangeService.getAll(page, limit);
      ApiResponse.success(res, exchanges, 'Exchanges retrieved', 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
  }
}
