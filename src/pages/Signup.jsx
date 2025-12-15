import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error } = await signup(formData);
            console.log('Signup Attempt Result:', { data, error });
            if (error) throw error;
            if (data?.session) {
                navigate('/dashboard');
            } else if (data?.user && !data?.session) {
                setError('Account created! Please check your email to confirm specific settings (or disable email confirm in Supabase).');
                // Optional: navigate to login or verify page
            } else {
                navigate('/dashboard'); // Fallback
            }
        } catch (err) {
            console.error('Signup Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card" style={{ maxWidth: '500px' }}>
            <h2 className="auth-title">Create Account</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        className="form-input"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        className="form-input"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Create a password"
                    />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+1 234 567 8900"
                    />
                </div>
                <div className="form-group">
                    <label>Address (Optional)</label>
                    <textarea
                        name="address"
                        className="form-input"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main St, City"
                        rows="2"
                    />
                </div>
                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
            <p className="link-text">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Signup;
