import { useState, useCallback, useRef, useEffect } from 'react';
import { FaShare, FaLink, FaTimes, FaCheck } from 'react-icons/fa';
import { canUseNativeShare } from '../../domain/distribution/distributionUtils';
import { buildShareUrl } from '../../domain/distribution/distributionRules';

export default function ShareSheet({ item, isOpen, onClose, onRecordShare }) {
  const [copied, setCopied] = useState(false);
  const sheetRef = useRef(null);

  const shareUrl = buildShareUrl(item);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onRecordShare?.('clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      onRecordShare?.('clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl, onRecordShare]);

  const handleNativeShare = useCallback(async () => {
    if (!canUseNativeShare()) return;
    try {
      await navigator.share({
        title: item?.title || item?.caption || 'Check this out',
        text: item?.content || item?.caption || '',
        url: shareUrl,
      });
      onRecordShare?.('native');
    } catch {
      // User cancelled
    }
  }, [item, shareUrl, onRecordShare]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="share-sheet-overlay" onClick={onClose}>
      <div
        ref={sheetRef}
        className="share-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Share content"
        tabIndex={-1}
      >
        <div className="share-sheet-header">
          <h3>Share</h3>
          <button className="share-sheet-close" onClick={onClose} aria-label="Close share sheet">
            <FaTimes />
          </button>
        </div>

        <div className="share-sheet-options">
          {canUseNativeShare() && (
            <button className="share-sheet-option" onClick={handleNativeShare} aria-label="Share via system dialog">
              <FaShare />
              <span>Share</span>
            </button>
          )}
          <button className="share-sheet-option" onClick={handleCopyLink} aria-label={copied ? 'Link copied' : 'Copy link to clipboard'}>
            {copied ? <FaCheck /> : <FaLink />}
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
