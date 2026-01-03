/**
 * Home View Component (MVC Pattern)
 * View Layer - Home page dashboard
 */
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <p className="welcome-text">Welcome, {user?.user_metadata?.full_name || user?.email}</p>

            <div className="auth-card">
                <h3>My Profile</h3>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Phone:</strong> {user?.user_metadata?.phone_number || 'N/A'}</p>

                <button onClick={handleLogout} className="auth-button" style={{ background: '#333', marginTop: '2rem' }}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Home;
