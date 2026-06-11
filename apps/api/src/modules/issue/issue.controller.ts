import { Request, Response, NextFunction } from 'express';
import { IssueService } from './issue.service';
import { IssueItemsSchema } from '@scouts/shared';
import { ApiResponse } from '../../utils/ApiResponse';

export class IssueController {
  /** @route GET /api/v1/issue/:scoutId @access ADMIN, OPERATOR_INVENTORY */
  static async getByScout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await IssueService.getIssuedByScout(req.params['scoutId']!);
      ApiResponse.success(res, items, 'Issued items retrieved');
    } catch (err) { next(err); }
  }

  /** @route POST /api/v1/issue @access ADMIN, OPERATOR_INVENTORY */
  static async issue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = IssueItemsSchema.parse(req.body);
      const items = await IssueService.issueItems(data, req.user!.sub);
      ApiResponse.created(res, items, 'Items issued successfully');
    } catch (err) { next(err); }
  }
}
