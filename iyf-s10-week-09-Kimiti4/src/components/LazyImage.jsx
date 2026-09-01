import { useState, useRef, useEffect } from 'react';

export default function LazyImage({ src, alt, className, style, ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={inView ? src : undefined}
      alt={alt}
      className={className}
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.2s', ...style }}
      onLoad={() => setLoaded(true)}
      loading="lazy"
      {...props}
    />
  );
}
