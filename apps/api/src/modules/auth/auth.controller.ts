import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { LoginSchema } from '@scouts/shared';
import { ApiResponse } from '../../utils/ApiResponse';
import { AppError } from '../../utils/AppError';

const isProduction = process.env['NODE_ENV'] === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export class AuthController {
  /**
   * @route POST /api/v1/auth/login
   * @access Public
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = LoginSchema.parse(req.body);
      const { tokens, refreshToken, user } = await AuthService.login(email, password);
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      ApiResponse.success(res, { ...tokens, user }, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route POST /api/v1/auth/refresh
   * @access Public (requires refreshToken cookie)
   */
  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (!refreshToken) {
        throw new AppError('Refresh token not found', 401, 'NO_REFRESH_TOKEN');
      }
      const tokens = await AuthService.refresh(refreshToken);
      ApiResponse.success(res, tokens, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route POST /api/v1/auth/logout
   * @access Private
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.jti) {
        await AuthService.logout(req.user.jti);
      }
      res.clearCookie('refreshToken', { path: '/' });
      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route GET /api/v1/auth/me
   * @access Private
   */
  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
      }
      ApiResponse.success(res, req.user, 'Current user');
    } catch (err) {
      next(err);
    }
  }
}
