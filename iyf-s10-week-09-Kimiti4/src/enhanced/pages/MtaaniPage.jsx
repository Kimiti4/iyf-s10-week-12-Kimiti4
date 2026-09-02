import { motion } from 'framer-motion'

const ACTIVITY = [
    {
        id: 'm1',
        title: 'Neighborhood Clean-up Drive',
        desc: 'Join volunteers this Saturday at 9 AM for a community clean-up along the river. Gloves and bags provided.',
        tags: ['Mtaani', 'Volunteer', 'Environment']
    },
    {
        id: 'm2',
        title: 'Estate Watch Report',
        desc: 'Residents reported increased lighting needs along the main street. Working with the county on installing more streetlights.',
        tags: ['Safety', 'Infrastructure']
    },
    {
        id: 'm3',
        title: 'Chama Savings Meeting',
        desc: 'Weekly savings circle meets at Mama Njeri\'s place. New members welcome. Bring your membership booklet.',
        tags: ['Finance', 'Chama']
    },
    {
        id: 'm4',
        title: 'Community Kitchen Sunday',
        desc: 'Every Sunday we cook for the neighborhood. Donations of maize, beans, and cooking oil are much appreciated.',
        tags: ['Food', 'Community']
    }
]

function MtaaniPage() {
    return (
        <main className="feature-page" role="main" aria-label="Mtaani">
            <div className="feature-hero">
                <div className="feature-eyebrow">
                    <span className="feature-emoji">🏘️</span> Your Neighborhood
                </div>
                <h1 className="feature-title">Mtaani</h1>
                <p className="feature-description">
                    Local news, events, and everyday happenings in your neighborhood. Stay connected with what's going on around you.
                </p>
                <div className="feature-stats">
                    <div className="stat-card">
                        <div className="stat-value">1.2K</div>
                        <div className="stat-label">Neighbors</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">48</div>
                        <div className="stat-label">Local events</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">126</div>
                        <div className="stat-label">Helpers active</div>
                    </div>
                </div>
            </div>

            <div className="feature-header">
                <h2 className="feature-header-title">Latest in Mtaani</h2>
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

export default MtaaniPage
