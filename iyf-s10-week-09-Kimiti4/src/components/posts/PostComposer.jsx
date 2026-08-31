import { useState } from 'react';
import { FaImage, FaTimes, FaSpinner } from 'react-icons/fa';
import { postsAPI } from '../../services/postApi';
import { normalizePost } from '../../contracts/postContract';
import { POST_CATEGORIES, POST_TITLE_MAX, POST_CONTENT_MAX } from '../../contracts/postContract';

const IDLE = 'idle';
const SUBMITTING = 'submitting';
const SUCCESS = 'success';
const ERROR = 'error';

const CATEGORY_OPTIONS = Object.entries(POST_CATEGORIES).map(([key, value]) => ({
  value,
  label: key.charAt(0) + key.slice(1).toLowerCase(),
}));

export default function PostComposer({ onCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(POST_CATEGORIES.ALL);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || status === SUBMITTING) return;

    setStatus(SUBMITTING);
    setError('');

    try {
      const postData = {
        title: title.trim() || undefined,
        content: content.trim(),
        category,
      };

      if (image) {
        // In production, upload to storage first
        postData.image = `uploads/${image.name}`;
      }

      const raw = await postsAPI.create(postData);
      const post = normalizePost(raw);

      setStatus(SUCCESS);
      setTitle('');
      setContent('');
      setCategory(POST_CATEGORIES.ALL);
      removeImage();

      onCreated?.(post);
    } catch (err) {
      setStatus(ERROR);
      setError(err.message || 'Failed to create post');
    }
  };

  return (
    <form className="post-composer" onSubmit={handleSubmit}>
      <div className="post-composer-header">
        <h3>New Post</h3>
        {onCancel && (
          <button type="button" className="post-composer-cancel" onClick={onCancel}>
            <FaTimes />
          </button>
        )}
      </div>

      <input
        type="text"
        className="post-composer-title"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value.slice(0, POST_TITLE_MAX))}
        maxLength={POST_TITLE_MAX}
      />

      <textarea
        className="post-composer-content"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, POST_CONTENT_MAX))}
        maxLength={POST_CONTENT_MAX}
        rows={4}
        required
      />

      <div className="post-composer-meta">
        <div className="post-composer-char-count">
          {content.length}/{POST_CONTENT_MAX}
        </div>
        <select
          className="post-composer-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {imagePreview && (
        <div className="post-composer-preview">
          <img src={imagePreview} alt="Preview" />
          <button type="button" className="post-composer-remove-image" onClick={removeImage}>
            <FaTimes />
          </button>
        </div>
      )}

      <div className="post-composer-footer">
        <label className="post-composer-image-btn" htmlFor="post-image-input">
          <FaImage aria-hidden="true" />
          <span>Photo</span>
        </label>
        <input
          id="post-image-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="post-composer-file-input"
        />

        <button
          type="submit"
          className="post-composer-submit"
          disabled={!content.trim() || status === SUBMITTING}
        >
          {status === SUBMITTING ? <><FaSpinner className="spinner" /> Posting...</> : 'Post'}
        </button>
      </div>

      {status === ERROR && (
        <div className="post-composer-error" role="alert">{error}</div>
      )}
    </form>
  );
}
