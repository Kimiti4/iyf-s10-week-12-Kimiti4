import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jamsAPI } from '../services/jamApi';
import JamCreationWizard from '../components/jam/JamCreationWizard';
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

  const handleComplete = useCallback(async (jamData) => {
    setStatus(LOADING);
    setErrorMessage('');

    try {
      const result = await jamsAPI.create(jamData);
      const jamId = result?.id || result?._id;
      if (!jamId) throw new Error('Jam was created but no Jam ID was returned');

      setStatus(SUCCESS);

      // Redirect to the new Jam after a brief moment
      setTimeout(() => {
        navigate(`/jams/${jamId}`);
      }, 1000);
    } catch (err) {
      setStatus(ERROR);
      setErrorMessage(err.message || 'Something went wrong');
    }
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (!user) {
    return (
      <div className="jam-creation-auth-required">
        <h2>Sign in to start a Jam</h2>
        <p>You need an account to create Jams.</p>
        <button onClick={() => navigate('/login')}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="jam-creation-page">
      {status === SUCCESS && (
        <div className="jam-creation-success" role="status">
          Jam created! Redirecting...
        </div>
      )}

      {status === ERROR && (
        <div className="jam-creation-error" role="alert">
          {errorMessage}
        </div>
      )}

      <JamCreationWizard
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}
