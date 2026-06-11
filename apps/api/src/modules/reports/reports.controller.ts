import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class ReportsController {
  static async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportsService.getDashboard();
      ApiResponse.success(res, data, 'Dashboard stats retrieved');
    } catch (err) { next(err); }
  }

  static async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.params;
      const data = await ReportsService.getReport(type as Parameters<typeof ReportsService.getReport>[0], req.query as Record<string, string>);
      ApiResponse.success(res, data, `${type} report retrieved`);
    } catch (err) { next(err); }
  }

  static async exportExcel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.params;
      const buffer = await ReportsService.exportExcel(type as Parameters<typeof ReportsService.exportExcel>[0], req.query as Record<string, string>);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${type}-${Date.now()}.xlsx"`,
      });
      res.send(buffer);
    } catch (err) { next(err); }
  }
}
