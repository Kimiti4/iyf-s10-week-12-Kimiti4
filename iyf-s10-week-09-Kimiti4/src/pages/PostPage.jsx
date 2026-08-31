import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import PostCard from '../components/posts/PostCard';
import CommentList from '../components/posts/CommentList';
import { usePosts } from '../hooks/usePosts';
import { usePostActions } from '../hooks/usePostActions';
import { useComments } from '../hooks/useComments';
import { postsAPI } from '../services/postApi';
import { normalizePost } from '../contracts/postContract';
import { trackView } from '../contracts/socialEventContract';
import { useAuth } from '../context/AuthContext';
import '../components/posts/posts.css';
import './PostPage.css';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');

  const { updatePost } = usePosts();
  const actions = usePostActions((postId, updates) => {
    setPost((prev) => (prev?.id === postId ? { ...prev, ...updates } : prev));
  });

  const {
    comments,
    status: commentsStatus,
    fetchComments,
    addComment,
    deleteComment,
    likeComment,
  } = useComments(id);

  const fetchPost = useCallback(async () => {
    setStatus(LOADING);
    try {
      const data = await postsAPI.getById(id);
      setPost(data);
      setStatus(LOADED);
      trackView('post', id);
    } catch (err) {
      setError(err.message || 'Failed to load post');
      setStatus(ERROR);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  if (status === LOADING) {
    return (
      <div className="post-page-loading">
        <div className="post-page-spinner" />
      </div>
    );
  }

  if (status === ERROR) {
    return (
      <div className="post-page-error" role="alert">
        {error}
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="post-page">
      <header className="post-page-header">
        <button className="post-page-back" onClick={() => navigate(-1)} aria-label="Go back">
          <FaArrowLeft />
        </button>
        <span className="post-page-title">Post</span>
      </header>

      <div className="post-page-content">
        <PostCard post={post} actions={actions} />

        <section className="post-page-comments">
          <h2 className="post-page-section-title">
            Comments
          </h2>
          <CommentList
            comments={comments}
            status={commentsStatus}
            onAddComment={addComment}
            onLikeComment={likeComment}
            onDeleteComment={deleteComment}
            currentUserId={user?.id || user?._id}
          />
        </section>
      </div>
    </div>
  );
}
