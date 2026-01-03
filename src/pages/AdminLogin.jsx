/**
 * AdminLogin View - Admin login page
 * This is a View in the MVC architecture
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { adminLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await adminLogin(email, password);
            if (error) throw error;
            navigate('/admin-dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card" style={{ borderColor: '#ff4d4f' }}>
            <h2 className="auth-title" style={{ background: 'linear-gradient(to right, #ff4d4f, #ff7875)' }}>Admin Portal</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Admin ID (Email)</label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@internal.com"
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Admin Password"
                    />
                </div>
                <button type="submit" className="auth-button" style={{ background: '#ff4d4f' }} disabled={loading}>
                    {loading ? 'Verifying...' : 'Access Console'}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
