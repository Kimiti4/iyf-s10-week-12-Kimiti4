import { useState, useCallback } from 'react';
import { commentsAPI } from '../services/postApi';
import { trackComment } from '../contracts/socialEventContract';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setStatus(LOADING);
    setError('');

    try {
      const data = await commentsAPI.getByPost(postId);
      setComments(data);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load comments');
      setStatus(ERROR);
    }
  }, [postId]);

  const addComment = useCallback(async (content, parentCommentId = null) => {
    if (!content.trim()) return null;

    try {
      const comment = await commentsAPI.create(postId, content.trim(), parentCommentId);
      trackComment(comment.id, postId);

      if (parentCommentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentCommentId
              ? { ...c, replies: [...(c.replies || []), comment] }
              : c
          )
        );
      } else {
        setComments((prev) => [comment, ...prev]);
      }

      return comment;
    } catch (err) {
      setError(err.message || 'Failed to post comment');
      return null;
    }
  }, [postId]);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await commentsAPI.delete(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      return true;
    } catch {
      return false;
    }
  }, [postId]);

  const likeComment = useCallback(async (commentId) => {
    try {
      const result = await commentsAPI.like(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, likeCount: result.likeCount, isLiked: result.isLiked }
            : c
        )
      );
    } catch {
      // Silent
    }
  }, []);

  return {
    comments,
    status,
    error,
    fetchComments,
    addComment,
    deleteComment,
    likeComment,
  };
}
