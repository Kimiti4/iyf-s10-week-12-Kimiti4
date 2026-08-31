import { FEED_TAB } from '../../domain/feed/feedTypes';

const TABS = [
  { id: FEED_TAB.FOR_YOU, label: 'For You' },
  { id: FEED_TAB.FOLLOWING, label: 'Following' },
  { id: FEED_TAB.JAMS, label: '🔥 Jams' },
];

export default function FeedTabs({ activeTab, onTabChange }) {
  return (
    <div className="feed-tabs" role="tablist" aria-label="Feed tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`feed-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
