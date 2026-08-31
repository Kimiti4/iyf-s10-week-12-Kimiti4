import { useState, useCallback, useRef, useEffect } from 'react';
import { FaShare, FaLink, FaBookmark, FaTimes } from 'react-icons/fa';

export default function ShareReelSheet({ reel, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const sheetRef = useRef(null);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/reels/${reel?.id || reel?._id || ''}`
    : '';

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel?.title || 'Check out this Reel',
          text: reel?.caption || '',
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    }
  }, [reel, shareUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="share-sheet-overlay" onClick={onClose}>
      <div
        ref={sheetRef}
        className="share-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Share reel"
      >
        <div className="share-sheet-header">
          <h3>Share</h3>
          <button className="share-sheet-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="share-sheet-options">
          {navigator.share && (
            <button className="share-sheet-option" onClick={handleNativeShare}>
              <FaShare />
              <span>Share</span>
            </button>
          )}
          <button className="share-sheet-option" onClick={handleCopyLink}>
            <FaLink />
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
