import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCreatorStudio } from '../hooks/useCreatorStudio';
import MetricsBar from '../components/creator/MetricsBar';
import TopContentList from '../components/creator/TopContentList';
import ContentCalendar from '../components/creator/ContentCalendar';
import DraftsList from '../components/creator/DraftsList';
import './CreatorStudioPage.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'content', label: 'My Content' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'drafts', label: 'Drafts' },
];

export default function CreatorStudioPage() {
  const { posts, reels, jams, metrics, analytics, drafts, status, fetchAnalytics, fetchDrafts, deleteDraft } = useCreatorStudio();
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d');

  useEffect(() => {
    if (activeTab === 'drafts') fetchDrafts();
    if (activeTab === 'overview') fetchAnalytics(analyticsPeriod);
  }, [activeTab, analyticsPeriod, fetchAnalytics, fetchDrafts]);

  return (
    <div className="creator-studio">
      <header className="creator-studio-header">
        <h1>Creator Studio</h1>
        <div className="creator-studio-actions">
          <Link to="/create/jam" className="creator-studio-btn primary">New Jam</Link>
          <Link to="/create/post" className="creator-studio-btn">New Post</Link>
        </div>
      </header>

      <nav className="creator-studio-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`creator-studio-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="creator-studio-content">
        {status === 'loading' && <div className="creator-studio-loading">Loading...</div>}

        {activeTab === 'overview' && (
          <div className="creator-studio-overview">
            <MetricsBar metrics={metrics} />
            <div className="creator-studio-section">
              <div className="creator-studio-section-header">
                <h2>Top Content</h2>
                <select
                  value={analyticsPeriod}
                  onChange={(e) => setAnalyticsPeriod(e.target.value)}
                  className="creator-studio-period"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              <TopContentList items={analytics.topContent} />
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="creator-studio-content-list">
            <h2>Posts ({posts.length})</h2>
            <TopContentList items={posts.map((p) => ({ ...p, type: 'post' }))} />
            <h2>Reels ({reels.length})</h2>
            <TopContentList items={reels.map((r) => ({ ...r, type: 'reel' }))} />
          </div>
        )}

        {activeTab === 'calendar' && (
          <ContentCalendar posts={posts} jams={jams} />
        )}

        {activeTab === 'drafts' && (
          <DraftsList drafts={drafts} onDelete={deleteDraft} />
        )}
      </div>
    </div>
  );
}
