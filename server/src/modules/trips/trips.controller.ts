import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { tripsService } from './trips.service';
import { AuthRequest } from '../../middlewares/authenticate';
import { getPaginationFromReq } from '../../utils/pagination';

export const tripsController = {
  create: catchAsync(async (req: AuthRequest, res: Response) => {
    const trip = await tripsService.createTrip(req.user!.id, req.body);
    ApiResponse.created(res, trip, 'Trip created');
  }),

  getMyTrips: catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit } = getPaginationFromReq(req);
    const { status } = req.query as { status?: string };
    const { trips, total } = await tripsService.getMyTrips(req.user!.id, page, limit, status);
    ApiResponse.paginated(res, trips, total, page, limit);
  }),

  getById: catchAsync(async (req: AuthRequest, res: Response) => {
    const trip = await tripsService.getTripById(req.params.id, req.user!.id);
    ApiResponse.success(res, trip);
  }),

  getByShareToken: catchAsync(async (req: AuthRequest, res: Response) => {
    const trip = await tripsService.getTripByShareToken(req.params.token);
    ApiResponse.success(res, trip);
  }),

  update: catchAsync(async (req: AuthRequest, res: Response) => {
    const trip = await tripsService.updateTrip(req.params.id, req.user!.id, req.body);
    ApiResponse.success(res, trip, 'Trip updated');
  }),

  delete: catchAsync(async (req: AuthRequest, res: Response) => {
    await tripsService.deleteTrip(req.params.id, req.user!.id);
    ApiResponse.noContent(res);
  }),

  archive: catchAsync(async (req: AuthRequest, res: Response) => {
    const trip = await tripsService.archiveTrip(req.params.id, req.user!.id);
    ApiResponse.success(res, trip, 'Trip archived');
  }),

  duplicate: catchAsync(async (req: AuthRequest, res: Response) => {
    const trip = await tripsService.duplicateTrip(req.params.id, req.user!.id);
    ApiResponse.created(res, trip, 'Trip duplicated');
  }),

  share: catchAsync(async (req: AuthRequest, res: Response) => {
    const trip = await tripsService.shareTrip(req.params.id, req.user!.id);
    ApiResponse.success(res, { shareToken: trip.shareToken }, 'Share link generated');
  }),

  uploadCover: catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.file) throw new Error('No image provided');
    const url = await tripsService.uploadCoverImage(req.params.id, req.user!.id, req.file.buffer);
    ApiResponse.success(res, { coverImage: url }, 'Cover image updated');
  }),

  getPublic: catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit } = getPaginationFromReq(req);
    const { trips, total } = await tripsService.getPublicTrips(page, limit);
    ApiResponse.paginated(res, trips, total, page, limit);
  }),

  // Stops
  addStop: catchAsync(async (req: AuthRequest, res: Response) => {
    const stop = await tripsService.addStop(req.params.id, req.user!.id, req.body);
    ApiResponse.created(res, stop, 'Stop added');
  }),

  updateStop: catchAsync(async (req: AuthRequest, res: Response) => {
    const stop = await tripsService.updateStop(req.params.id, req.params.stopId, req.user!.id, req.body);
    ApiResponse.success(res, stop, 'Stop updated');
  }),

  deleteStop: catchAsync(async (req: AuthRequest, res: Response) => {
    await tripsService.deleteStop(req.params.id, req.params.stopId, req.user!.id);
    ApiResponse.noContent(res);
  }),

  reorderStops: catchAsync(async (req: AuthRequest, res: Response) => {
    await tripsService.reorderStops(req.params.id, req.user!.id, req.body.stopIds);
    ApiResponse.success(res, null, 'Stops reordered');
  }),
};
