/**
 * 🎨 Creator Ownership Dashboard
 * Features: Rights Ledger, Sales Tracking, Revenue Analytics, Creator Passport
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './CreatorDashboard.css';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Mock creator data - Replace with actual API calls
  const [creatorData, setCreatorData] = useState({
    rights: [
      {
        id: 1,
        title: 'Digital Art Collection #1',
        type: 'image',
        license: 'All Rights Reserved',
        registered: Date.now() - 86400000 * 30,
        sales: 45,
        revenue: 2250,
        watermark: true
      },
      {
        id: 2,
        title: 'Music Track - "Nairobi Nights"',
        type: 'audio',
        license: 'CC-BY-NC',
        registered: Date.now() - 86400000 * 15,
        sales: 120,
        revenue: 3600,
        watermark: true
      },
      {
        id: 3,
        title: 'E-Book: Community Building Guide',
        type: 'document',
        license: 'CC-BY',
        registered: Date.now() - 86400000 * 7,
        sales: 78,
        revenue: 1560,
        watermark: false
      }
    ],
    sales: [
      { id: 1, work: 'Digital Art Collection #1', buyer: 'John K.', price: 50, date: Date.now() - 3600000, fee: 1.75, net: 48.25 },
      { id: 2, work: 'Music Track - "Nairobi Nights"', buyer: 'Sarah M.', price: 30, date: Date.now() - 7200000, fee: 1.17, net: 28.83 },
      { id: 3, work: 'E-Book: Community Building Guide', buyer: 'Mike C.', price: 20, date: Date.now() - 10800000, fee: 1.00, net: 19.00 },
      { id: 4, work: 'Digital Art Collection #1', buyer: 'Lisa P.', price: 50, date: Date.now() - 14400000, fee: 1.75, net: 48.25 },
      { id: 5, work: 'Music Track - "Nairobi Nights"', buyer: 'David O.', price: 30, date: Date.now() - 18000000, fee: 1.17, net: 28.83 },
    ],
    stats: {
      totalWorks: 3,
      totalSales: 243,
      totalRevenue: 7410,
      platformFees: 259.35,
      netEarnings: 7150.65,
      avgRetention: 96.5,
      thisMonth: {
        sales: 45,
        revenue: 2250,
        net: 2171.25
      }
    }
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (timestamp) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const exportCreatorPassport = () => {
    const passport = {
      creator_id: user?.id,
      name: user?.name,
      verified_since: '2024-01-15',
      metrics: creatorData.stats,
      works: creatorData.rights.map(w => ({
        title: w.title,
        type: w.type,
        license: w.license,
        total_sales: w.sales,
        total_revenue: w.revenue
      })),
      export_date: new Date().toISOString(),
      signature: 'HMAC-SHA256-signed-by-jamiilink'
    };

    const blob = new Blob([JSON.stringify(passport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-passport-${user?.name?.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="creator-loading">
        <div className="loading-spinner"></div>
        <p>Loading your creator dashboard...</p>
      </div>
    );
  }

  return (
    <div className="creator-dashboard">
      {/* Header */}
      <div className="creator-header">
        <div className="header-content">
          <h1> Creator Studio</h1>
          <p>Manage your intellectual property and track your earnings</p>
        </div>
        <button className="btn-export-passport" onClick={exportCreatorPassport}>
          📄 Export Creator Passport
        </button>
      </div>

      {/* Stats Overview */}
      <div className="creator-stats">
        <div className="stat-card">
          <div className="stat-icon">🎨</div>
          <div className="stat-info">
            <span className="stat-value">{creatorData.stats.totalWorks}</span>
            <span className="stat-label">Total Works</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(creatorData.stats.totalRevenue)}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(creatorData.stats.netEarnings)}</span>
            <span className="stat-label">Your Earnings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{creatorData.stats.avgRetention}%</span>
            <span className="stat-label">You Keep</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="creator-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rights' ? 'active' : ''}`}
          onClick={() => setActiveTab('rights')}
        >
           Rights Ledger
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
           Sales History
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              className="overview-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* This Month */}
              <div className="overview-card">
                <h3>📅 This Month</h3>
                <div className="overview-stats">
                  <div className="overview-stat">
                    <span className="label">Sales</span>
                    <span className="value">{creatorData.stats.thisMonth.sales}</span>
                  </div>
                  <div className="overview-stat">
                    <span className="label">Revenue</span>
                    <span className="value">{formatCurrency(creatorData.stats.thisMonth.revenue)}</span>
                  </div>
                  <div className="overview-stat">
                    <span className="label">Net Earnings</span>
                    <span className="value highlight">{formatCurrency(creatorData.stats.thisMonth.net)}</span>
                  </div>
                </div>
              </div>

              {/* Fee Transparency */}
              <div className="overview-card">
                <h3>💸 Fee Breakdown</h3>
                <div className="fee-visual">
                  <div className="fee-bar">
                    <div className="fee-segment platform" style={{ width: '3.5%' }}></div>
                    <div className="fee-segment processing" style={{ width: '2.9%' }}></div>
                    <div className="fee-segment creator" style={{ width: '93.6%' }}></div>
                  </div>
                  <div className="fee-legend">
                    <span className="legend-item">
                      <span className="dot platform"></span>
                      Platform (3.5%)
                    </span>
                    <span className="legend-item">
                      <span className="dot processing"></span>
                      Processing (2.9%)
                    </span>
                    <span className="legend-item">
                      <span className="dot creator"></span>
                      You Keep (93.6%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Sales */}
              <div className="overview-card full-width">
                <h3>🔥 Recent Sales</h3>
                <div className="recent-sales">
                  {creatorData.sales.slice(0, 3).map((sale) => (
                    <div key={sale.id} className="sale-item">
                      <div className="sale-info">
                        <span className="sale-work">{sale.work}</span>
                        <span className="sale-buyer">to {sale.buyer}</span>
                      </div>
                      <div className="sale-amount">
                        <span className="sale-price">{formatCurrency(sale.price)}</span>
                        <span className="sale-net">You earned: {formatCurrency(sale.net)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rights' && (
            <motion.div 
              key="rights"
              className="rights-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {creatorData.rights.map((work) => (
                <div key={work.id} className="rights-card">
                  <div className="rights-header">
                    <div className="work-icon">
                      {work.type === 'image' && '🎨'}
                      {work.type === 'audio' && '🎵'}
                      {work.type === 'document' && '📄'}
                      {work.type === 'video' && '🎬'}
                    </div>
                    <div className="work-details">
                      <h3>{work.title}</h3>
                      <span className="work-type">{work.type.toUpperCase()}</span>
                    </div>
                    <div className="work-license">
                      <span className="license-badge">{work.license}</span>
                    </div>
                  </div>
                  
                  <div className="rights-stats">
                    <div className="right-stat">
                      <span className="label">Sales</span>
                      <span className="value">{work.sales}</span>
                    </div>
                    <div className="right-stat">
                      <span className="label">Revenue</span>
                      <span className="value">{formatCurrency(work.revenue)}</span>
                    </div>
                    <div className="right-stat">
                      <span className="label">Registered</span>
                      <span className="value">{formatDate(work.registered)}</span>
                    </div>
                    <div className="right-stat">
                      <span className="label">Watermark</span>
                      <span className={`value ${work.watermark ? 'active' : 'inactive'}`}>
                        {work.watermark ? '✓ Protected' : ' Not Protected'}
                      </span>
                    </div>
                  </div>

                  <div className="rights-actions">
                    <button className="btn-view-proof">View Proof</button>
                    <button className="btn-update-license">Update License</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'sales' && (
            <motion.div 
              key="sales"
              className="sales-table-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Work</th>
                    <th>Buyer</th>
                    <th>Price</th>
                    <th>Fee</th>
                    <th>You Keep</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {creatorData.sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="work-name">{sale.work}</td>
                      <td>{sale.buyer}</td>
                      <td className="price">{formatCurrency(sale.price)}</td>
                      <td className="fee">{formatCurrency(sale.fee)}</td>
                      <td className="net highlight">{formatCurrency(sale.net)}</td>
                      <td>{formatDate(sale.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              className="analytics-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="analytics-card">
                <h3>📈 Revenue Trend</h3>
                <div className="chart-placeholder">
                  <p>Revenue analytics chart will appear here</p>
                  <p className="chart-note">(Integrate with Chart.js or Recharts)</p>
                </div>
              </div>

              <div className="analytics-card">
                <h3>🏆 Top Performing Works</h3>
                {creatorData.rights
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((work, index) => (
                    <div key={work.id} className="top-work">
                      <span className="rank">#{index + 1}</span>
                      <span className="work-title">{work.title}</span>
                      <span className="work-revenue">{formatCurrency(work.revenue)}</span>
                    </div>
                  ))}
              </div>

              <div className="analytics-card">
                <h3>🎯 Creator Impact</h3>
                <div className="impact-stats">
                  <div className="impact-item">
                    <span className="impact-icon">👥</span>
                    <div className="impact-info">
                      <span className="impact-value">243</span>
                      <span className="impact-label">People Supported Your Work</span>
                    </div>
                  </div>
                  <div className="impact-item">
                    <span className="impact-icon">🌍</span>
                    <div className="impact-info">
                      <span className="impact-value">15</span>
                      <span className="impact-label">Countries Reached</span>
                    </div>
                  </div>
                  <div className="impact-item">
                    <span className="impact-icon">⭐</span>
                    <div className="impact-info">
                      <span className="impact-value">4.9</span>
                      <span className="impact-label">Average Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreatorDashboard;
