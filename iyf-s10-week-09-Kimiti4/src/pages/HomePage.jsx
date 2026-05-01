import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to JamiiLink</h1>
        <p>Connecting Kenyan Communities - Share, Trade, and Grow Together</p>
        <div className="hero-buttons">
          <Link to="/posts" className="btn btn-primary">Browse Posts</Link>
          <Link to="/about" className="btn btn-secondary">Learn More</Link>
        </div>
      </div>
      
      <div className="features">
        <div className="feature-card">
          <h3>🏘️ Mtaani Alerts</h3>
          <p>Stay informed about neighborhood news and urgent updates</p>
        </div>
        <div className="feature-card">
          <h3>🎯 Skill Swaps</h3>
          <p>Exchange skills and learn from your community</p>
        </div>
        <div className="feature-card">
          <h3>🌾 Farm Market</h3>
          <p>Buy and sell fresh produce directly from farmers</p>
        </div>
        <div className="feature-card">
          <h3>💼 Gig Economy</h3>
          <p>Find work opportunities and hire talent</p>
        </div>
      </div>
    </div>
  )
}
