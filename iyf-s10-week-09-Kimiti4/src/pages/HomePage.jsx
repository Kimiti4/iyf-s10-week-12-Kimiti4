import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { colors } from '../styles/designSystem'

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  const features = [
    { emoji: '🏘️', title: 'Mtaani Alerts', desc: 'Neighborhood buzz & urgent updates', bg: colors.primary[100] },
    { emoji: '🎯', title: 'Skill Swap', desc: 'Trade talents, learn together', bg: colors.accent[100] },
    { emoji: '🌾', title: 'Farm Market', desc: 'Fresh from farm to table', bg: colors.primary[200] },
    { emoji: '💼', title: 'Gig Hub', desc: 'Work opportunities nearby', bg: colors.accent[200] },
    { emoji: '🎪', title: 'Community Quests', desc: 'Team missions & rewards', bg: colors.primary[100] },
    { emoji: '🗳️', title: 'Governance', desc: 'Shape the community together', bg: colors.accent[100] }
  ]

  return (
    <main className="home-page" role="main" aria-label="Home">
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🌟 Welcome to JamiiLink! 🌟
        </motion.h1>
        <motion.p 
          className="hero-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Where Kenyan communities connect, create, and celebrate together
        </motion.p>
        <motion.div className="hero-buttons">
          <Link to="/posts" className="btn btn-primary btn-lg">
            🚀 Explore Community Feed
          </Link>
          <Link to="/about" className="btn btn-secondary btn-lg">
            🎯 Discover More
          </Link>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="features-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="section-title">✨ What's Happening in Your Jamii? ✨</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="feature-card"
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.03,
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)'
              }}
              style={{ backgroundColor: feature.bg }}
            >
              <span className="feature-emoji">{feature.emoji}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="cta-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2>🎉 Ready to Join the Jamii?</h2>
        <p>Connect with neighbors, share skills, trade fresh produce, and grow together!</p>
        <Link to="/register" className="btn btn-accent btn-lg">
          🎈 Sign Up - It's Free!
        </Link>
      </motion.div>
    </main>
  )
}