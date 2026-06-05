import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { usersService } from './users.service';
import { AuthRequest } from '../../middlewares/authenticate';
import { getPaginationFromReq } from '../../utils/pagination';

export const usersController = {
  getMyProfile: catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await usersService.getMyProfile(req.user!.id);
    ApiResponse.success(res, user);
  }),

  updateMyProfile: catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await usersService.updateMyProfile(req.user!.id, req.body);
    ApiResponse.success(res, user, 'Profile updated');
  }),

  uploadAvatar: catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.file) throw new Error('No image uploaded');
    const url = await usersService.uploadAvatar(req.user!.id, req.file.buffer);
    ApiResponse.success(res, { avatarUrl: url }, 'Avatar updated');
  }),

  deleteMyAccount: catchAsync(async (req: AuthRequest, res: Response) => {
    await usersService.deleteMyAccount(req.user!.id);
    ApiResponse.noContent(res);
  }),

  getAllUsers: catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit } = getPaginationFromReq(req);
    const { users, total } = await usersService.getAllUsers(page, limit, req.query as Record<string, string>);
    ApiResponse.paginated(res, users, total, page, limit);
  }),

  searchUsers: catchAsync(async (req: AuthRequest, res: Response) => {
    const { q } = req.query as { q: string };
    const { page, limit } = getPaginationFromReq(req);
    const { users, total } = await usersService.searchUsers(q || '', page, limit);
    ApiResponse.paginated(res, users, total, page, limit);
  }),

  getUserById: catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await usersService.getUserById(req.params.id);
    ApiResponse.success(res, user);
  }),

  updateUser: catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await usersService.updateUser(req.params.id, req.body);
    ApiResponse.success(res, user, 'User updated');
  }),

  deleteUser: catchAsync(async (req: AuthRequest, res: Response) => {
    await usersService.deleteUser(req.params.id);
    ApiResponse.noContent(res);
  }),

  suspendUser: catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await usersService.updateStatus(req.params.id, 'SUSPENDED');
    ApiResponse.success(res, user, 'User suspended');
  }),

  banUser: catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await usersService.updateStatus(req.params.id, 'BANNED');
    ApiResponse.success(res, user, 'User banned');
  }),

  activateUser: catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await usersService.updateStatus(req.params.id, 'ACTIVE');
    ApiResponse.success(res, user, 'User activated');
  }),

  assignRole: catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await usersService.assignRole(req.params.id, req.body.roleId);
    ApiResponse.success(res, user, 'Role assigned');
  }),

  exportUsers: catchAsync(async (_req: AuthRequest, res: Response) => {
    ApiResponse.success(res, { message: 'Export feature coming soon' });
  }),
};
