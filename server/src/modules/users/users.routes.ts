import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validateRequest';
import { updateProfileSchema, updateUserSchema } from './users.validation';
import { uploadSingle } from '../../middlewares/upload';
import { auditLog } from '../../middlewares/auditLogger';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ---- Own Profile ----
router.get('/me', usersController.getMyProfile);
router.put('/me', validate(updateProfileSchema), usersController.updateMyProfile);
router.post('/me/avatar', uploadSingle, usersController.uploadAvatar);
router.delete('/me', usersController.deleteMyAccount);

// ---- Admin: User Management ----
router.get('/', authorize({ permissions: ['MANAGE_USERS'] }), usersController.getAllUsers);
router.get('/search', authorize({ permissions: ['MANAGE_USERS'] }), usersController.searchUsers);
router.get('/export', authorize({ permissions: ['MANAGE_USERS'] }), usersController.exportUsers);
router.get('/:id', authorize({ permissions: ['MANAGE_USERS'] }), usersController.getUserById);
router.put('/:id', authorize({ permissions: ['MANAGE_USERS'] }), validate(updateUserSchema), auditLog({ action: 'UPDATE_USER', resource: 'users' }), usersController.updateUser);
router.delete('/:id', authorize({ permissions: ['MANAGE_USERS'] }), auditLog({ action: 'DELETE_USER', resource: 'users' }), usersController.deleteUser);
router.post('/:id/suspend', authorize({ permissions: ['MANAGE_USERS'] }), auditLog({ action: 'SUSPEND_USER', resource: 'users' }), usersController.suspendUser);
router.post('/:id/ban', authorize({ permissions: ['BAN_USERS'] }), auditLog({ action: 'BAN_USER', resource: 'users' }), usersController.banUser);
router.post('/:id/activate', authorize({ permissions: ['MANAGE_USERS'] }), usersController.activateUser);
router.post('/:id/assign-role', authorize({ permissions: ['MANAGE_ROLES'] }), auditLog({ action: 'ASSIGN_ROLE', resource: 'users' }), usersController.assignRole);

export default router;
