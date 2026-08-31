import { useState } from 'react';

export default function PostMedia({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) return null;

  return (
    <div className="post-media">
      {!loaded && <div className="post-media-skeleton" />}
      <img
        src={src}
        alt={alt || ''}
        className={`post-media-img ${loaded ? 'loaded' : ''}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}
