/**
 * 🌟 About JamiiLink - Where Community Meets Magic!
 */

import { motion } from 'framer-motion'
import { colors } from '../styles/designSystem'

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const techStack = [
    { name: 'React 18', icon: '⚛️', desc: 'Modern UI magic' },
    { name: 'Vite', icon: '⚡', desc: 'Lightning-fast builds' },
    { name: 'Framer Motion', icon: '🎬', desc: 'Delightful animations' },
    { name: 'Socket.IO', icon: '🔌', desc: 'Real-time connections' },
    { name: 'CSS3', icon: '🎨', desc: 'Beautiful styling' }
  ]

  return (
    <motion.div 
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div className="about-hero" {...fadeInUp}>
        <h1 className="hero-title">🌟 About JamiiLink 🌟</h1>
        <p className="hero-subtitle">Building bridges, one neighbor at a time</p>
      </motion.div>
      
      <div className="about-content">
        <motion.section className="about-section" {...fadeInUp}>
          <div className="section-icon">🏠</div>
          <h2>What is JamiiLink?</h2>
          <p>
            JamiiLink is your digital neighborhood where Kenyan communities 
            <strong> share stories</strong>, <strong>trade treasures</strong>, and <strong>grow together</strong>! 
            Think of it as your local community center, but online and open 24/7.
          </p>
        </motion.section>
        
        <motion.section className="about-section highlight" {...fadeInUp}>
          <div className="section-icon">🎯</div>
          <h2>Our Mission</h2>
          <p>
            To empower Kenyan communities by providing accessible technology solutions that facilitate 
            communication, commerce, and collaboration at the grassroots level. We believe in the power 
            of <span className="highlight-text">Ubuntu</span> - "I am because we are"!
          </p>
        </motion.section>
        
        <motion.section className="about-section" {...fadeInUp}>
          <div className="section-icon">✨</div>
          <h2>Amazing Features</h2>
          <ul className="features-list">
            <li>
              <span className="feature-badge">🚨</span>
              <strong>Mtaani Alerts:</strong> Real-time neighborhood updates and emergency notifications
            </li>
            <li>
              <span className="feature-badge">🤝</span>
              <strong>Skill Swaps:</strong> Exchange skills and services within your community
            </li>
            <li>
              <span className="feature-badge">🍅</span>
              <strong>Farm Market:</strong> Direct farmer-to-consumer marketplace for fresh produce
            </li>
            <li>
              <span className="feature-badge">💼</span>
              <strong>Gig Economy:</strong> Find work opportunities and hire local talent
            </li>
            <li>
              <span className="feature-badge">🎪</span>
              <strong>Quests:</strong> Team missions that reward community collaboration
            </li>
            <li>
              <span className="feature-badge">🗳️</span>
              <strong>Governance:</strong> Democratic decision-making for the community
            </li>
          </ul>
        </motion.section>
        
        <motion.section className="about-section tech-section" {...fadeInUp}>
          <div className="section-icon">🛠️</div>
          <h2>Tech Stack (Week 9)</h2>
          <div className="tech-grid">
            {techStack.map((tech) => (
              <motion.div 
                key={tech.name}
                className="tech-card"
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <span className="tech-icon">{tech.icon}</span>
                <h3>{tech.name}</h3>
                <p>{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
        
        <motion.section className="about-section fun-section" {...fadeInUp}>
          <div className="section-icon">🎓</div>
          <h2>About This Project</h2>
          <p>
            This project was built as part of IYF Weekend Academy Season 10, Week 9, focusing on 
            advanced React concepts including:
          </p>
          <ul className="skills-list">
            <li>⚡ Lightning-fast component composition</li>
            <li>🎣 React Hooks mastery (useState, useEffect)</li>
            <li>🧭 Client-side routing with React Router</li>
            <li>📡 Real-time data fetching patterns</li>
            <li>📱 Responsive design that works everywhere</li>
            <li>🎬 Delightful animations with Framer Motion</li>
          </ul>
        </motion.section>
        
        <motion.div 
          className="join-callout"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>🚀 Ready to Join the Adventure?</h2>
          <p>Become part of our growing Jamii today!</p>
          <div className="callout-buttons">
            <a href="/register" className="btn btn-primary">Join Now 🎉</a>
            <a href="/posts" className="btn btn-secondary">Explore First 👀</a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}