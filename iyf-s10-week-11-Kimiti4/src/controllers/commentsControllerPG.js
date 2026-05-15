/**
 * 🔹 Comments Controller - PostgreSQL Version
 */
const { CommentRepository, PostRepository } = require('../database');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

/**
 * GET comments for a post
 */
const getComments = asyncHandler(async (req, res) => {
  const comments = await CommentRepository.findByPost(req.params.postId, 50);
  
  res.json({
    success: true,
    postId: req.params.postId,
    count: comments.length,
    data: comments
  });
});

/**
 * CREATE comment (protected)
 */
const createComment = asyncHandler(async (req, res) => {
  const { content, parentId } = req.body;
  const postId = req.params.postId;
  
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

module.exports = { getComments, createComment, deleteComment };
