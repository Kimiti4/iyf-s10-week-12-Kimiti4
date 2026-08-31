import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

export default function CommentComposer({ onSubmit, placeholder = 'Write a comment...' }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-composer" onSubmit={handleSubmit}>
      <input
        type="text"
        className="comment-composer-input"
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={2000}
        disabled={submitting}
        aria-label="Write a comment"
      />
      <button
        type="submit"
        className="comment-composer-submit"
        disabled={!content.trim() || submitting}
        aria-label="Post comment"
      >
        <FaPaperPlane />
      </button>
    </form>
  );
}
