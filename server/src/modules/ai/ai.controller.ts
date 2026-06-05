import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { aiService } from './ai.service';
import { AuthRequest } from '../../middlewares/authenticate';
import { getPaginationFromReq } from '../../utils/pagination';

export const aiController = {
  chat: catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await aiService.chat({
      userId: req.user!.id,
      message: req.body.message,
      conversationId: req.body.conversationId,
      agentType: req.body.agentType,
      model: req.body.model,
      tripId: req.body.tripId,
    });
    ApiResponse.success(res, result);
  }),

  generateItinerary: catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await aiService.generateItinerary({
      userId: req.user!.id,
      ...req.body,
    });
    ApiResponse.success(res, result, 'Itinerary generated');
  }),

  estimateBudget: catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await aiService.estimateBudget({
      userId: req.user!.id,
      ...req.body,
    });
    ApiResponse.success(res, result, 'Budget estimated');
  }),

  generatePackingList: catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await aiService.generatePackingList({
      userId: req.user!.id,
      ...req.body,
    });
    ApiResponse.success(res, result, 'Packing list generated');
  }),

  analyzeRisk: catchAsync(async (req: AuthRequest, res: Response) => {
    const { destination, travelDate } = req.body;
    const result = await aiService.analyzeRisk(destination, travelDate);
    ApiResponse.success(res, result, 'Risk analysis complete');
  }),

  suggestDestinations: catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await aiService.suggestDestinations({
      userId: req.user!.id,
      ...req.body,
    });
    ApiResponse.success(res, result, 'Destinations suggested');
  }),

  getConversations: catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit } = getPaginationFromReq(req);
    const { conversations, total } = await aiService.getConversations(req.user!.id, page, limit);
    ApiResponse.paginated(res, conversations, total, page, limit);
  }),

  getConversationById: catchAsync(async (req: AuthRequest, res: Response) => {
    const conversation = await aiService.getConversationById(req.params.id, req.user!.id);
    ApiResponse.success(res, conversation);
  }),

  deleteConversation: catchAsync(async (req: AuthRequest, res: Response) => {
    await aiService.deleteConversation(req.params.id, req.user!.id);
    ApiResponse.noContent(res);
  }),
};
