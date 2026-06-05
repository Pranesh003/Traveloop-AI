import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { authService } from './auth.service';
import { tokenService } from '../../services/token.service';
import { AuthRequest } from '../../middlewares/authenticate';

export const authController = {
  /**
   * POST /api/auth/signup
   */
  signup: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    tokenService.setTokenCookies(res, result.tokens);

    ApiResponse.created(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    }, 'Account created successfully. Please verify your email.');
  }),

  /**
   * POST /api/auth/login
   */
  login: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    tokenService.setTokenCookies(res, result.tokens);

    ApiResponse.success(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    }, 'Login successful');
  }),

  /**
   * POST /api/auth/logout
   */
  logout: catchAsync(async (req: AuthRequest, res: Response) => {
    if (req.user) await authService.logout(req.user.id);
    tokenService.clearTokenCookies(res);
    ApiResponse.success(res, null, 'Logged out successfully');
  }),

  /**
   * POST /api/auth/refresh
   */
  refresh: catchAsync(async (req: Request, res: Response) => {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    const result = await authService.refreshTokens(token);
    tokenService.setTokenCookies(res, result.tokens);

    ApiResponse.success(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  }),

  /**
   * POST /api/auth/forgot-password
   */
  forgotPassword: catchAsync(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    ApiResponse.success(res, null, 'If an account exists, a reset link has been sent.');
  }),

  /**
   * POST /api/auth/reset-password
   */
  resetPassword: catchAsync(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    ApiResponse.success(res, null, 'Password reset successfully. Please log in.');
  }),

  /**
   * POST /api/auth/verify-email
   */
  verifyEmail: catchAsync(async (req: Request, res: Response) => {
    await authService.verifyEmail(req.body.token);
    ApiResponse.success(res, null, 'Email verified successfully');
  }),

  /**
   * GET /api/auth/me
   */
  getMe: catchAsync(async (req: AuthRequest, res: Response) => {
    ApiResponse.success(res, req.user);
  }),
};
