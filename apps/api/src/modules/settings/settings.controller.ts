import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class SettingsController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configs = await SettingsService.getAll();
      ApiResponse.success(res, configs, 'Settings retrieved');
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key, value } = req.body as { key: string; value: string };
      const config = await SettingsService.set(key, value, req.user!.sub);
      ApiResponse.success(res, config, 'Setting updated');
    } catch (err) { next(err); }
  }

  static async updateBulk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entries } = req.body as { entries: Array<{ key: string; value: string }> };
      const configs = await SettingsService.setBulk(entries, req.user!.sub);
      ApiResponse.success(res, configs, 'Settings updated');
    } catch (err) { next(err); }
  }
}
