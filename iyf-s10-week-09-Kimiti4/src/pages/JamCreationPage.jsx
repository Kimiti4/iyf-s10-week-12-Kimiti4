import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JamCreationWizard from '../components/jam/JamCreationWizard';
import PageHeader from '../components/primitives/PageHeader';
import EmptyState from '../components/primitives/EmptyState';
import ErrorState from '../components/primitives/ErrorState';
import { jamsAPI } from '../services/jamApi';
import '../components/jam/jam.css';

const IDLE = 'idle';
const LOADING = 'loading';
const SUCCESS = 'success';
const ERROR = 'error';

export default function JamCreationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(IDLE);
  const [errorMessage, setErrorMessage] = useState('');

  const handleComplete = useCallback(
    async (jamData) => {
      setStatus(LOADING);
      setErrorMessage('');
      try {
        const payload = {
          ...jamData,
          status: jamData.status || 'active',
        };
        const result = await jamsAPI.create(payload);
        const jamId =
          result?.data?.id ||
          result?.data?._id ||
          result?.id ||
          result?._id;
        if (!jamId) {
          throw new Error('Jam was created but the server returned no ID.');
        }
        setStatus(SUCCESS);
        setTimeout(() => navigate(`/jams/${jamId}`), 800);
      } catch (err) {
        setStatus(ERROR);
        setErrorMessage(err.message || 'Failed to create Jam');
      }
    },
    [navigate]
  );

  const handleCancel = useCallback(() => navigate(-1), [navigate]);

  if (!user) {
    return (
      <main className="jam-creation-page" role="main" aria-label="Create Jam">
        <PageHeader
          eyebrow="Collaborate"
          title="Start a Jam"
          subtitle="You need an account to host a Jam"
        />
        <EmptyState
          icon="🔐"
          title="Sign in required"
          message="Create an account or sign in to start a Jam"
          action={{ label: 'Sign in', onClick: () => navigate('/login') }}
        />
        <p className="jam-creation-auth-footer">
          No account? <Link to="/register">Register</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="jam-creation-page" role="main" aria-label="Create Jam">
      <PageHeader
        eyebrow="Collaborate"
        title="Start a Jam"
        subtitle="Turn your audience into participants"
        actions={
          <Link to="/jams" className="btn btn-ghost">
            Browse Jams
          </Link>
        }
      />

      {status === SUCCESS && (
        <div className="jam-creation-success" role="status">
          Jam created. Redirecting…
        </div>
      )}

      {status === ERROR && (
        <ErrorState
          error={errorMessage}
          onRetry={() => {
            setStatus(IDLE);
            setErrorMessage('');
          }}
        />
      )}

      {status !== SUCCESS && (
        <JamCreationWizard
          onComplete={handleComplete}
          onCancel={handleCancel}
          isSubmitting={status === LOADING}
        />
      )}
    </main>
  );
}
