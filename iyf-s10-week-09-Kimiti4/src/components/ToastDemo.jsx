/**
 * 🔹 Toast Usage Examples & Demo Component
 * Shows how to use the toast notification system
 */

import { useToast } from './Toast';

export default function ToastDemo() {
    const { success, error, warning, info } = useToast();

    return (
        <div style={{ padding: '2rem', maxWidth: '600px' }}>
            <h2>Toast Notification Demo</h2>
            <p>Click the buttons below to see different toast types:</p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <button 
                    onClick={() => success('Post created successfully!')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Success Toast
                </button>

                <button 
                    onClick={() => error('Failed to save changes. Please try again.')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Error Toast
                </button>

                <button 
                    onClick={() => warning('Your session will expire in 5 minutes.')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Warning Toast
                </button>

                <button 
                    onClick={() => info('New feature available! Check it out.')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Info Toast
                </button>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                <h3>Usage in Your Components:</h3>
                <pre style={{ fontSize: '0.875rem', overflowX: 'auto' }}>
{`import { useToast } from './components/Toast';

function MyComponent() {
    const { success, error, warning, info } = useToast();

    const handleSubmit = async () => {
        try {
            await api.post('/data', formData);
            success('Data saved successfully!');
        } catch (err) {
            error('Failed to save data');
        }
    };

    return <button onClick={handleSubmit}>Save</button>;
}`}
                </pre>
            </div>
        </div>
    );
}
