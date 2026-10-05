export default function UnavailableFeaturePage({ title, icon, description, capability }) {
  return (
    <main className="feature-page" role="main" aria-label={title}>
      <section className="feature-hero">
        <div className="feature-eyebrow"><span className="feature-emoji" aria-hidden="true">{icon}</span> Community feature</div>
        <h1 className="feature-title">{title}</h1>
        <p className="feature-description">{description}</p>
      </section>
      <section className="feature-card" role="status" aria-live="polite">
        <h2>Live data is unavailable</h2>
        <p>{capability}</p>
        <p>No sample counts, listings, events, offers, prices, or activity are displayed as real community data.</p>
      </section>
    </main>
  );
}
