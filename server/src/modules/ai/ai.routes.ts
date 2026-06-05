import { Router } from 'express';
import { aiController } from './ai.controller';
import { authenticate } from '../../middlewares/authenticate';
import { aiLimiter } from '../../middlewares/rateLimiter';

const router = Router();
router.use(authenticate);
router.use(aiLimiter);

router.post('/chat', aiController.chat);
router.post('/itinerary', aiController.generateItinerary);
router.post('/budget', aiController.estimateBudget);
router.post('/packing', aiController.generatePackingList);
router.post('/risk', aiController.analyzeRisk);
router.post('/suggest', aiController.suggestDestinations);

router.get('/conversations', aiController.getConversations);
router.get('/conversations/:id', aiController.getConversationById);
router.delete('/conversations/:id', aiController.deleteConversation);

export default router;
