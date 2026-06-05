import { Router } from 'express';
import { tripsController } from './trips.controller';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validateRequest';
import { createTripSchema, updateTripSchema, addStopSchema, reorderStopsSchema } from './trips.validation';
import { uploadSingle } from '../../middlewares/upload';
import { optionalAuth } from '../../middlewares/authenticate';

const router = Router();

// Public trips
router.get('/public', optionalAuth, tripsController.getPublic);
router.get('/shared/:token', optionalAuth, tripsController.getByShareToken);

// Protected
router.use(authenticate);

router.post('/', validate(createTripSchema), tripsController.create);
router.get('/', tripsController.getMyTrips);
router.get('/:id', tripsController.getById);
router.put('/:id', validate(updateTripSchema), tripsController.update);
router.delete('/:id', tripsController.delete);
router.post('/:id/archive', tripsController.archive);
router.post('/:id/duplicate', tripsController.duplicate);
router.post('/:id/share', tripsController.share);
router.post('/:id/cover', uploadSingle, tripsController.uploadCover);

// Stops
router.post('/:id/stops', validate(addStopSchema), tripsController.addStop);
router.put('/:id/stops/:stopId', tripsController.updateStop);
router.delete('/:id/stops/:stopId', tripsController.deleteStop);
router.post('/:id/stops/reorder', validate(reorderStopsSchema), tripsController.reorderStops);

export default router;
