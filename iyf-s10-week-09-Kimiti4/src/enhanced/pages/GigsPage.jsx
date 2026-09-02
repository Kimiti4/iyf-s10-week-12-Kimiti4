import { motion } from 'framer-motion'

const ACTIVITY = [
    {
        id: 'g1',
        title: 'Delivery Rider Needed',
        desc: 'Looking for a reliable rider for weekday deliveries around town. Own bike preferred, paid per trip.',
        tags: ['Delivery', 'Transport']
    },
    {
        id: 'g2',
        title: 'Event Stewarding Weekend',
        desc: 'Short-term stewarding gig for a weekend event. Uniform and meals provided, daily pay.',
        tags: ['Events', 'Short-term']
    },
    {
        id: 'g3',
        title: 'Freelance Content Creator',
        desc: 'Small business needs help with flyers and social posts. Portfolio welcome, flexible hours.',
        tags: ['Creative', 'Freelance']
    },
    {
        id: 'g4',
        title: 'Home Tutoring (Primary Math)',
        desc: 'Tutor needed for after-school math help three days a week. Rate negotiable.',
        tags: ['Education', 'Part-time']
    }
]

function GigsPage() {
    return (
        <main className="feature-page" role="main" aria-label="Gigs">
            <div className="feature-hero">
                <div className="feature-eyebrow">
                    <span className="feature-emoji">💼</span> Earn &amp; Contribute
                </div>
                <h1 className="feature-title">Gigs</h1>
                <p className="feature-description">
                    Find short-term work, side hustles, and flexible opportunities in your area.
                </p>
                <div className="feature-stats">
                    <div className="stat-card">
                        <div className="stat-value">74</div>
                        <div className="stat-label">Open gigs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">38</div>
                        <div className="stat-label">Employers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">142</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
            </div>

            <div className="feature-header">
                <h2 className="feature-header-title">Latest Gigs</h2>
            </div>

            <div className="feature-grid">
                {ACTIVITY.map((item, i) => (
                    <motion.div
                        key={item.id}
                        className="feature-card"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <h3 className="feature-card-title">{item.title}</h3>
                        <p className="feature-card-desc">{item.desc}</p>
                        <div className="feature-card-tags">
                            {item.tags.map((tag) => (
                                <span key={tag} className="feature-tag">{tag}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </main>
    )
}

export default GigsPage
