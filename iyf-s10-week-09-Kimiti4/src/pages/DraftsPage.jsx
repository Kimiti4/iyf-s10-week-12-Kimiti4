/**
 * 📭 Drafts Page — shows offline-queued posts and lets users sync/discard them.
 * Reads the same IndexedDB store that CreatePostPage writes to.
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import {
  getPendingPosts,
  deletePendingPost,
  clearPendingPosts,
  flushPendingPosts,
  isOnline,
  triggerSync
} from '../utils/offlinePost';
import './DraftsPage.css';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();

  const loadDrafts = useCallback(async () => {
    try {
      const pending = await getPendingPosts();
      setDrafts(pending.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error('Failed to load drafts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();

    // Refresh when connectivity or SW-sync changes
    const onConnectivity = () => loadDrafts();
    const onSyncComplete = () => loadDrafts();
    window.addEventListener('online', onConnectivity);
    window.addEventListener('offline', onConnectivity);
    navigator.serviceWorker?.addEventListener('message', (e) => {
      if (e.data?.type === 'SYNC_COMPLETE') onSyncComplete();
    });

    return () => {
      window.removeEventListener('online', onConnectivity);
      window.removeEventListener('offline', onConnectivity);
      navigator.serviceWorker?.removeEventListener('message', onSyncComplete);
    };
  }, [loadDrafts]);

  const handleSyncNow = async () => {
    if (!isOnline()) {
      toast.warning('You are offline. Reconnect to sync drafts.');
      return;
    }
    setSyncing(true);
    try {
      const { synced, failed } = await flushPendingPosts();
      await triggerSync();
      if (synced > 0) toast.success(`${synced} draft${synced === 1 ? '' : 's'} synced! 🎉`);
      else if (failed > 0) toast.info(`${failed} draft${failed === 1 ? '' : 's'} will retry.`);
      else toast.info('No pending drafts to sync.');
      await loadDrafts();
    } catch (err) {
      toast.error('Sync failed. Please try again.');
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDiscard = async (id) => {
    await deletePendingPost(id);
    await loadDrafts();
    toast.info('Draft discarded');
  };

  const handleClearAll = async () => {
    await clearPendingPosts();
    await loadDrafts();
    toast.info('All drafts cleared');
  };

  return (
    <div className="drafts-page">
      <div className="drafts-header">
        <h1>📭 Pending Drafts</h1>
        <p>
          Posts saved while you were offline. They sync automatically when you
          reconnect.
        </p>
        <div className="drafts-actions">
          <motion.button
            className="btn-sync"
            onClick={handleSyncNow}
            disabled={syncing || !isOnline()}
            whileTap={{ scale: 0.97 }}
          >
            {syncing ? 'Syncing…' : 'Sync Now'}
          </motion.button>
          {drafts.length > 0 && (
            <motion.button
              className="btn-clear"
              onClick={handleClearAll}
              whileTap={{ scale: 0.97 }}
            >
              Clear All
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="drafts-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Loading drafts…
          </motion.div>
        ) : drafts.length === 0 ? (
          <motion.div key="empty" className="drafts-empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="empty-illustration">🗂️</div>
            <h3>No pending drafts</h3>
            <p>
              When you create a post offline, it'll appear here and sync the
              moment you're back online.
            </p>
          </motion.div>
        ) : (
          <motion.div key="list" className="drafts-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {drafts.map((draft) => (
              <motion.div
                key={draft.id}
                className="draft-card"
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <div className="draft-content">
                  <h4 className="draft-title">{draft.data?.title || 'Untitled post'}</h4>
                  <p className="draft-preview">
                    {(draft.data?.content || draft.data?.description || '').slice(0, 160) ||
                      'No content preview available.'}
                  </p>
                  <div className="draft-meta">
                    <span>
                      📅 {new Date(draft.createdAt).toLocaleString()}
                    </span>
                    <span className={draft.retries > 0 ? 'draft-retries warn' : 'draft-retries'}>
                      Retries: {draft.retries || 0}/5
                    </span>
                  </div>
                </div>
                <button
                  className="draft-discard"
                  onClick={() => handleDiscard(draft.id)}
                  aria-label={`Discard draft: ${draft.data?.title || 'untitled'}`}
                >
                  Discard
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}