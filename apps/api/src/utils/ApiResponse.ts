import { Response } from 'express';
import { PaginationMeta } from '@scouts/shared';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: PaginationMeta
  ): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      ...(meta && { meta }),
    });
  }

  static created<T>(res: Response, data: T, message = 'Created'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(res: Response, message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown[]): Response {
    return res.status(statusCode).json({
      success: false,
      error: { code, message, ...(details && { details }) },
    });
  }
}
