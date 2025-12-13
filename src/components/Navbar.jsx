import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User, Heart, AlertTriangle, Hand, Stethoscope,
    ShoppingBag, Info, FileText, Bell, LogOut
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar animate-fade-in">
            <Link to="/dashboard" className="nav-brand">
                Relief Chain
            </Link>

            <div className="nav-links">
                <Link to="/profile" className="nav-item">
                    <User className="nav-icon" /> Profile
                </Link>
                <Link to="/donations" className="nav-item">
                    <Heart className="nav-icon" /> Donate
                </Link>
                <Link to="/disasters" className="nav-item">
                    <AlertTriangle className="nav-icon" /> Disasters
                </Link>
                <Link to="/volunteer" className="nav-item">
                    <Hand className="nav-icon" /> Volunteer
                </Link>
                <Link to="/medical" className="nav-item">
                    <Stethoscope className="nav-icon" /> Medical
                </Link>
                <Link to="/shop" className="nav-item">
                    <ShoppingBag className="nav-icon" /> Shop
                </Link>
                <Link to="/about" className="nav-item">
                    <Info className="nav-icon" /> About
                </Link>
                <Link to="/policy" className="nav-item">
                    <FileText className="nav-icon" /> Policy
                </Link>

                <div className="nav-item">
                    <Bell className="nav-icon" />
                </div>

                <button
                    onClick={handleLogout}
                    className="nav-item"
                    style={{ background: 'transparent', border: 'none', padding: 0 }}
                >
                    <LogOut className="nav-icon" style={{ color: '#ff4d4f' }} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
