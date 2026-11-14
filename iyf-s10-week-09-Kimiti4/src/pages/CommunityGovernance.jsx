import UnavailableFeaturePage from '../components/UnavailableFeaturePage';

export default function CommunityGovernance() {
  return (
    <UnavailableFeaturePage
      title="Community governance"
      icon="🗳️"
      description="Propose and vote on community decisions."
      capability="The backend does not yet expose a proposal or voting service."
    />
  );
}
