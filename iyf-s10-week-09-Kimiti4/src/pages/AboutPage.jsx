import { Link } from 'react-router-dom';
import PageHeader from '../components/primitives/PageHeader';

export default function AboutPage() {
  const techStack = [
    { name: 'React 18', desc: 'UI' },
    { name: 'Vite', desc: 'Build' },
    { name: 'Express', desc: 'API' },
    { name: 'PostgreSQL', desc: 'Data' },
    { name: 'Socket.IO', desc: 'Realtime' },
  ];

  return (
    <main className="about-page" role="main" aria-label="About">
      <PageHeader
        eyebrow="JamiiLink"
        title="About"
        subtitle="Where Kenyan communities connect, create, and collaborate"
      />

      <div className="about-content">
        <section className="about-section">
          <h2>What is JamiiLink?</h2>
          <p>
            JamiiLink is a community platform for neighborhoods to share updates,
            trade skills and produce, find local work, and collaborate on shared goals.
          </p>
        </section>

        <section className="about-section">
          <h2>Mission</h2>
          <p>
            Empower grassroots communities with accessible tools for communication,
            commerce, and collaboration — grounded in Ubuntu: “I am because we are.”
          </p>
        </section>

        <section className="about-section">
          <h2>Features</h2>
          <ul className="features-list">
            <li>
              <strong>Feed & alerts</strong> — community posts and neighborhood notices
            </li>
            <li>
              <strong>Jams</strong> — creator-led participation challenges
            </li>
            <li>
              <strong>Skills & reputation</strong> — profiles, matches, and standing
            </li>
            <li>
              <strong>Messaging</strong> — direct conversations
            </li>
            <li>
              <strong>Organizations</strong> — schools, estates, NGOs, and groups
            </li>
          </ul>
          <p className="about-note">
            Some routes (quests, governance, farm/gigs marketplace) are reserved for
            future APIs and intentionally show “unavailable” rather than sample data.
          </p>
        </section>

        <section className="about-section tech-section">
          <h2>Stack</h2>
          <div className="tech-grid">
            {techStack.map((tech) => (
              <div key={tech.name} className="tech-card">
                <h3>{tech.name}</h3>
                <p>{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="join-callout">
          <h2>Get started</h2>
          <p>Join the jamii or explore the feed.</p>
          <div className="callout-buttons">
            <Link to="/register" className="btn btn-primary">
              Create account
            </Link>
            <Link to="/" className="btn btn-secondary">
              Open feed
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
