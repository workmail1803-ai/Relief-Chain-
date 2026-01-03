/**
 * Login View - User login page component
 * This is a View in the MVC architecture
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getUserRole } from '../models/authModel';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // Get isAdmin and global auth loading state to handle auto-redirect correctly
    const { login, user, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Auto-redirect for logged-in users
    useEffect(() => {
        // Wait for auth verification to complete before redirecting
        if (!authLoading && user) {
            if (isAdmin) {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, isAdmin, authLoading, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data: { user: authUser }, error } = await login(email, password);
            if (error) throw error;

            if (authUser) {
                // Fetch profile to check role immediately for smoother UX
                const { data: profile } = await getUserRole(authUser.id);

                if (profile?.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <h2 className="auth-title">Welcome</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
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
                        placeholder="Enter your password"
                    />
                </div>
                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="link-text">
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
        </div>
    );
};

export default Login;
