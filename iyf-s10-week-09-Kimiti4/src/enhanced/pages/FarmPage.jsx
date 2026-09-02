import { motion } from 'framer-motion'

const ACTIVITY = [
    {
        id: 'f1',
        title: 'Fresh Produce Market Day',
        desc: 'Saturday market with tomatoes, kale, maize, and avocados straight from local farms.',
        tags: ['Produce', 'Market']
    },
    {
        id: 'f2',
        title: 'Drip Irrigation Workshop',
        desc: 'Hands-on session on setting up simple drip irrigation for small plots. Materials provided.',
        tags: ['Farming', 'Water']
    },
    {
        id: 'f3',
        title: 'Poultry Raising Starter Pack',
        desc: 'Guidance on starting a backyard poultry venture — breeds, feeding, and health basics.',
        tags: ['Livestock', 'Startup']
    },
    {
        id: 'f4',
        title: 'Seed Exchange & Nursery',
        desc: 'Swap quality seeds and learn nursery techniques for better germination and yields.',
        tags: ['Seeds', 'Nursery']
    }
]

function FarmPage() {
    return (
        <main className="feature-page" role="main" aria-label="Farm">
            <div className="feature-hero">
                <div className="feature-eyebrow">
                    <span className="feature-emoji">🌱</span> Grow Together
                </div>
                <h1 className="feature-title">Farm</h1>
                <p className="feature-description">
                    Market produce, share farming know-how, and buy fresh from your neighbors.
                </p>
                <div className="feature-stats">
                    <div className="stat-card">
                        <div className="stat-value">210</div>
                        <div className="stat-label">Produce listings</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">86</div>
                        <div className="stat-label">Active farms</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">64</div>
                        <div className="stat-label">Buyers</div>
                    </div>
                </div>
            </div>

            <div className="feature-header">
                <h2 className="feature-header-title">Farm Market Highlights</h2>
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

export default FarmPage
