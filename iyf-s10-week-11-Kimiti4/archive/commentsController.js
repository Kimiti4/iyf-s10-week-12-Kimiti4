/**
 * 🔹 Comments Controller
 */
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

/**
 * GET comments for a post
 */
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'username profile.avatar')
    .sort({ createdAt: -1 })
    .limit(50);
  
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
  const { content } = req.body;
  const postId = req.params.postId;
  
  // Verify post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError('Post not found', 404);
  }
  
  const comment = await Comment.create({
    content,
    author: req.user._id,
    post: postId
  });
  
  // Add comment to post's comments array
  post.comments.push(comment._id);
  await post.save();
  
  // Populate for response
  await comment.populate('author', 'username profile.avatar');
  
  res.status(201).json({ success: true, data: comment });
});

/**
 * DELETE comment (owner or admin)
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  
  if (!comment) {
    throw new ApiError('Comment not found', 404);
  }
  
  // Authorization
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError('You can only delete your own comments', 403);
  }
  
  // Remove from post's comments array
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: comment._id }
  });
  
  await comment.deleteOne();
  
  res.status(204).send();
});

module.exports = { getComments, createComment, deleteComment };
