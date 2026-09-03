export default function LoadingSpinner({ size = 'md', text = '' }) {
  return (
    <div className={`loading-container loading-${size}`} role="status" aria-label="Loading">
      <div className="spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
