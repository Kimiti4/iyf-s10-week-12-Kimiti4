import UnavailableFeaturePage from '../../components/UnavailableFeaturePage';

export default function GigsPage() {
  return (
    <UnavailableFeaturePage
      title="Gigs"
      icon="💼"
      description="Find short-term work, side hustles, and flexible opportunities."
      capability="The current backend does not provide a verified live gigs feed."
    />
  );
}
