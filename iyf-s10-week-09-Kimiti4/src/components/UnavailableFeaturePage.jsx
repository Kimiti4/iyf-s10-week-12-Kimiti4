import { Link } from 'react-router-dom';
import PageHeader from './primitives/PageHeader';

/**
 * Honest unavailable feature — never shows fabricated live data.
 */
export default function UnavailableFeaturePage({
  title,
  icon = '🚧',
  description,
  capability,
  backTo = '/',
  backLabel = 'Back to feed',
}) {
  return (
    <main className="feature-page" role="main" aria-label={title}>
      <PageHeader
        eyebrow="Coming later"
        title={title}
        subtitle={description}
        actions={
          <Link to={backTo} className="btn btn-ghost">
            {backLabel}
          </Link>
        }
      />
      <section className="feature-card" role="status" aria-live="polite">
        <div className="feature-card-icon" aria-hidden="true">
          {icon}
        </div>
        <h2>Live data is unavailable</h2>
        <p>{capability}</p>
        <p className="feature-card-note">
          No sample counts, listings, events, offers, prices, or activity are shown as real data.
        </p>
      </section>
    </main>
  );
}
