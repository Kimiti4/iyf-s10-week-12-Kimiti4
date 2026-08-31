import { useEffect } from 'react';
import ReelFeed from '../components/reels/ReelFeed';
import '../components/reels/reels.css';

export default function ReelsPage() {
  useEffect(() => {
    document.body.style.background = '#000';
    return () => { document.body.style.background = ''; };
  }, []);

  return (
    <div className="reels-page">
      <header className="reels-page-header">
        <h1 className="reels-page-title">Reels</h1>
      </header>
      <ReelFeed emptyMessage="No reels to show" />
    </div>
  );
}
