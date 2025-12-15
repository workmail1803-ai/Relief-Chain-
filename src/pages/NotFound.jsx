import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
            <p style={{ fontSize: '1.5rem', color: '#aaa', marginBottom: '2rem' }}>Page Not Found</p>
            <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '400px' }}>
                The page you are looking for doesn't exist or has been moved.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: 'transparent', border: '1px solid #333',
                    color: '#ccc', borderRadius: '8px', cursor: 'pointer'
                }}>
                    <ArrowLeft size={18} /> Go Back
                </button>

                <Link to="/dashboard" style={{
                    padding: '12px 24px', background: '#ef4444',
                    color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
                }}>
                    Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
