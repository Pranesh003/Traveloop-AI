import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { optionalAuth, AuthRequest } from '../../middlewares/authenticate';
import { getPaginationFromReq } from '../../utils/pagination';
import { Post, Comment } from '../../config/database/mongodb/models/Community';
import { AppError } from '../../utils/AppError';

const router = Router();

// --- Posts ---
router.get('/', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const [posts, total] = await Promise.all([
    Post.find({ isPublished: true, isDeleted: false }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments({ isPublished: true, isDeleted: false }),
  ]);
  ApiResponse.paginated(res, posts, total, page, limit);
}));

router.post('/', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const post = await Post.create({ userId: req.user!.id, ...req.body });
  ApiResponse.created(res, post, 'Post created');
}));

router.get('/:id', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) throw AppError.notFound('Post');
  ApiResponse.success(res, post);
}));

router.put('/:id', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { ...req.body },
    { new: true },
  );
  if (!post) throw AppError.notFound('Post');
  ApiResponse.success(res, post, 'Post updated');
}));

router.delete('/:id', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  if (!post) throw AppError.notFound('Post');

  // Owners can delete their own; admins can delete any
  const isOwner = post.userId === req.user!.id;
  const isAdmin = req.user!.permissions.includes('DELETE_CONTENT');
  if (!isOwner && !isAdmin) throw AppError.forbidden();

  await Post.findByIdAndUpdate(req.params.id, { isDeleted: true });
  ApiResponse.noContent(res);
}));

router.post('/:id/like', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw AppError.notFound('Post');

  const liked = post.likes.includes(req.user!.id);
  if (liked) {
    post.likes = post.likes.filter(id => id !== req.user!.id);
    post.likeCount = Math.max(0, post.likeCount - 1);
  } else {
    post.likes.push(req.user!.id);
    post.likeCount += 1;
  }
  await post.save();
  ApiResponse.success(res, { liked: !liked, likeCount: post.likeCount });
}));

router.post('/:id/report', authenticate, catchAsync(async (req: AuthRequest, res) => {
  await Post.findByIdAndUpdate(req.params.id, {
    $push: { reports: { userId: req.user!.id, reason: req.body.reason, createdAt: new Date() } },
  });
  ApiResponse.success(res, null, 'Report submitted');
}));

// --- Comments ---
router.get('/:postId/comments', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const [comments, total] = await Promise.all([
    Comment.find({ postId: req.params.postId, isDeleted: false, parentId: null })
      .sort({ createdAt: -1 }).skip(skip).limit(limit),
    Comment.countDocuments({ postId: req.params.postId, isDeleted: false, parentId: null }),
  ]);
  ApiResponse.paginated(res, comments, total, page, limit);
}));

router.post('/:postId/comments', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const comment = await Comment.create({ postId: req.params.postId, userId: req.user!.id, ...req.body });
  await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentCount: 1 } });
  ApiResponse.created(res, comment, 'Comment added');
}));

router.delete('/:postId/comments/:commentId', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const comment = await Comment.findOne({ _id: req.params.commentId });
  if (!comment) throw AppError.notFound('Comment');
  const isOwner = comment.userId === req.user!.id;
  const isAdmin = req.user!.permissions.includes('DELETE_CONTENT');
  if (!isOwner && !isAdmin) throw AppError.forbidden();
  await Comment.findByIdAndUpdate(req.params.commentId, { isDeleted: true });
  ApiResponse.noContent(res);
}));

export default router;
