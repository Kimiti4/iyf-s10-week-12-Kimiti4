/**
 * Drafts — offline-queued posts (IndexedDB)
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import PageHeader from '../components/primitives/PageHeader';
import EmptyState from '../components/primitives/EmptyState';
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
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();

    const onConnectivity = () => loadDrafts();
    window.addEventListener('online', onConnectivity);
    window.addEventListener('offline', onConnectivity);
    navigator.serviceWorker?.addEventListener('message', (e) => {
      if (e.data?.type === 'SYNC_COMPLETE') loadDrafts();
    });

    return () => {
      window.removeEventListener('online', onConnectivity);
      window.removeEventListener('offline', onConnectivity);
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
      if (synced > 0) toast.success(`${synced} draft${synced === 1 ? '' : 's'} synced`);
      else if (failed > 0) toast.info(`${failed} draft${failed === 1 ? '' : 's'} will retry`);
      else toast.info('No pending drafts to sync');
      await loadDrafts();
    } catch {
      toast.error('Sync failed. Please try again.');
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
      <PageHeader
        eyebrow="Offline"
        title="Drafts"
        subtitle="Posts saved while offline. They sync when you reconnect."
        actions={
          <div className="drafts-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSyncNow}
              disabled={syncing || !isOnline()}
            >
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>
            {drafts.length > 0 && (
              <button type="button" className="btn btn-ghost" onClick={handleClearAll}>
                Clear all
              </button>
            )}
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="drafts-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
            Loading drafts…
          </motion.div>
        ) : drafts.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title="No pending drafts"
            message="When you create a post offline, it appears here and syncs when you are back online"
          />
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
                  <h3 className="draft-title">{draft.data?.title || 'Untitled post'}</h3>
                  <p className="draft-preview">
                    {(draft.data?.content || draft.data?.description || '').slice(0, 160) ||
                      'No content preview available.'}
                  </p>
                  <div className="draft-meta">
                    <span>{new Date(draft.createdAt).toLocaleString()}</span>
                    <span className={draft.retries > 0 ? 'draft-retries warn' : 'draft-retries'}>
                      Retries: {draft.retries || 0}/5
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost draft-discard"
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
