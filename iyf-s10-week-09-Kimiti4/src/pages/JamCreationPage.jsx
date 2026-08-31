import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/jams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jamData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to create Jam');
      }

      const result = await response.json();
      setStatus(SUCCESS);

      // Redirect to the new Jam after a brief moment
      setTimeout(() => {
        navigate(`/jams/${result.id || result._id}`);
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
