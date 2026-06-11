import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { CreateUserSchema, UpdateUserSchema } from '@scouts/shared';
import { ApiResponse } from '../../utils/ApiResponse';

export class UsersController {
  /** @route GET /api/v1/users @access ADMIN */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query['page']) || 1;
      const limit = Number(req.query['limit']) || 20;
      const { users, total } = await UsersService.getAll(page, limit);
      ApiResponse.success(res, users, 'Users retrieved', 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
  }

  /** @route GET /api/v1/users/:id @access ADMIN */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UsersService.getById(req.params['id']!);
      ApiResponse.success(res, user, 'User retrieved');
    } catch (err) { next(err); }
  }

  /** @route POST /api/v1/users @access ADMIN */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateUserSchema.parse(req.body);
      const user = await UsersService.create(data);
      ApiResponse.created(res, user, 'User created');
    } catch (err) { next(err); }
  }

  /** @route PUT /api/v1/users/:id @access ADMIN */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateUserSchema.parse(req.body);
      const user = await UsersService.update(req.params['id']!, data);
      ApiResponse.success(res, user, 'User updated');
    } catch (err) { next(err); }
  }
}
