import UnavailableFeaturePage from '../../components/UnavailableFeaturePage';

export default function FarmPage() {
  return (
    <UnavailableFeaturePage
      title="Farm"
      icon="🌱"
      description="Share farming knowledge and connect local produce with buyers."
      capability="The current backend does not provide an authoritative live farm marketplace feed."
    />
  );
}
