/**
 * 🔹 Comments Controller - PostgreSQL Version
 */
const { CommentRepository, PostRepository } = require('../database');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

/**
 * GET comments for a post
 *
 * R3 note: the nested posts router registers this as `/:id/comments`, so the
 * post id arrives as either `postId` or `id` depending on the mount style.
 */
const getComments = asyncHandler(async (req, res) => {
  const postId = req.params.postId || req.params.id;
  const comments = await CommentRepository.findByPost(postId, 50);
  
  res.json({
    success: true,
    postId,
    count: comments.length,
    data: comments
  });
});

/**
 * CREATE comment (protected)
 */
const createComment = asyncHandler(async (req, res) => {
  const { content, parentId } = req.body;
  const postId = req.params.postId || req.params.id;
  
  // Verify post exists
  const post = await PostRepository.findById(postId);
  if (!post) {
    throw new ApiError('Post not found', 404);
  }
  
  const comment = await CommentRepository.create({
    content,
    authorId: req.user.id,
    postId,
    parentId
  });
  
  // Get author info for response
  const commentWithAuthor = await CommentRepository.findById(comment.id);

  // Notify the post author (not for self-comments; best-effort)
  try {
    const authorId = post.author?.id;
    if (authorId && String(authorId) !== String(req.user.id)) {
      const { createNotification, emitToUser } = require('./notificationsControllerPG');
      const note = await createNotification({
        userId: authorId,
        actorId: req.user.id, type: 'comment', targetType: 'post', referenceId: postId
      });
      emitToUser(authorId, 'notification:new', { id: note.id, type: 'comment' });
    }
  } catch {
    // Notification delivery is best-effort
  }

  res.status(201).json({
    success: true,
    data: commentWithAuthor
  });
});

/**
 * DELETE comment (owner or admin)
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await CommentRepository.findById(req.params.commentId);
  
  if (!comment) {
    throw new ApiError('Comment not found', 404);
  }
  
  // Authorization
  if (comment.author_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'founder') {
    throw new ApiError('You can only delete your own comments', 403);
  }
  
  await CommentRepository.delete(comment.id);
  
  res.status(204).send();
});

/**
 * LIKE comment (protected; any authenticated user; R3 [P1-8/P1-9 U3])
 */
const likeComment = asyncHandler(async (req, res) => {
  const comment = await CommentRepository.findById(req.params.commentId);

  if (!comment) {
    throw new ApiError('Comment not found', 404);
  }

  // The comment must belong to the post in the path (nested-route integrity).
  const postId = req.params.postId || req.params.id;
  if (postId && comment.post_id !== postId) {
    throw new ApiError('Comment does not belong to this post', 404);
  }

  const liked = await CommentRepository.like(comment.id);

  res.json({
    success: true,
    data: { id: liked.id, likes: liked.likes }
  });
});

module.exports = { getComments, createComment, deleteComment, likeComment };
