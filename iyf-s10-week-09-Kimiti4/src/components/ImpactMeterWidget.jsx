import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import './ImpactMeterWidget.css';

export default function ImpactMeterWidget({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await api.impact.getDashboard(userId);
        if (res.data) setData(res.data);
      } catch {
        // Fetch impact failed silently
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchImpact();
  }, [userId]);

  if (loading) return <div className="impact-loading">Loading impact...</div>;
  if (!data) return null;

  return (
    <motion.div 
      className="impact-widget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>🌟 Community Impact Meter</h3>
      <p className="tagline">See the real difference you're making</p>

      <div className="impact-circle-container">
        <div className="impact-circle">
          <span className="impact-number">{data.monthly_impact}</span>
          <span className="impact-label">Impact Points</span>
        </div>
      </div>

      <div className="impact-rank">
        <strong>Rank:</strong> {data.impact_rank}
      </div>

      <div className="impact-breakdown">
        <div className="breakdown-item">
          <span>🤝 Help Provided</span>
          <strong>{data.contribution_breakdown.help_provided}</strong>
        </div>
        <div className="breakdown-item">
          <span>🔁 Exchanges Completed</span>
          <strong>{data.contribution_breakdown.exchange_completed ?? 0}</strong>
        </div>
        <div className="breakdown-item">
          <span>⏱️ Time Saved</span>
          <strong>{data.contribution_breakdown.time_saved}</strong>
        </div>
      </div>

      {data.period && (
        <p className="impact-period">
          Period: {new Date(data.period.start).toLocaleDateString()} – {new Date(data.period.end).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}
