import { motion } from 'framer-motion'

const ACTIVITY = [
    {
        id: 's1',
        title: 'Carpentry for Beginners',
        desc: 'Learn basic carpentry — measuring, cutting, and joining wood. Bring your own tools if you have them.',
        tags: ['Craft', 'Workshop']
    },
    {
        id: 's2',
        title: 'Digital Marketing Basics',
        desc: 'A free intro to social media marketing for small businesses. Covers content, reach, and ads.',
        tags: ['Business', 'Digital']
    },
    {
        id: 's3',
        title: 'Kiswahili Tutoring Swap',
        desc: 'Native speaker offering Kiswahili lessons in exchange for English or coding help.',
        tags: ['Language', 'Swap']
    },
    {
        id: 's4',
        title: 'Mobile Phone Repair',
        desc: 'Weekly repair clinic — learn to fix cracked screens, batteries, and charging ports.',
        tags: ['Tech', 'Hands-on']
    }
]

function SkillsPage() {
    return (
        <main className="feature-page" role="main" aria-label="Skills">
            <div className="feature-hero">
                <div className="feature-eyebrow">
                    <span className="feature-emoji">🤝</span> Learn &amp; Share
                </div>
                <h1 className="feature-title">Skills</h1>
                <p className="feature-description">
                    Swap skills, join workshops, and grow together. Everyone knows something worth teaching.
                </p>
                <div className="feature-stats">
                    <div className="stat-card">
                        <div className="stat-value">340</div>
                        <div className="stat-label">Skills offered</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">52</div>
                        <div className="stat-label">Workshops</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">29</div>
                        <div className="stat-label">Mentors</div>
                    </div>
                </div>
            </div>

            <div className="feature-header">
                <h2 className="feature-header-title">Upcoming Skill Opportunities</h2>
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

export default SkillsPage
