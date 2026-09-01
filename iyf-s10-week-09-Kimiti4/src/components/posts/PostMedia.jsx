import { useState, useRef, useEffect } from 'react';

export default function PostMedia({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!src || error) return null;

  return (
    <div className="post-media" ref={ref}>
      {!loaded && inView && <div className="post-media-skeleton" />}
      {inView && (
        <img
          src={src}
          alt={alt || ''}
          className={`post-media-img ${loaded ? 'loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}
