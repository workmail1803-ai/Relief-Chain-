import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import {
    User, Heart, AlertTriangle, Hand, Stethoscope,
    ShoppingBag, Info, FileText, Bell, LogOut, Check, X
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Subscribe to realtime notifications here
        }
    }, [user]);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    const markAsRead = async (id) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleAcceptInvite = async (notif) => {
        if (notif.type !== 'invite' || !notif.meta_data?.disaster_id) return;

        try {
            // Update volunteer status to 'joined' (assuming 'invited' status exists)
            // Or just ensure they are inserted as 'joined' now if accepting

            // 1. Update disaster_volunteers status
            const { error } = await supabase
                .from('disaster_volunteers')
                .update({ status: 'joined' })
                .eq('user_id', user.id)
                .eq('disaster_id', notif.meta_data.disaster_id);

            if (error) throw error;

            alert("Invite accepted! You have joined the relief effort.");
            markAsRead(notif.id);
            navigate(`/disaster/${notif.meta_data.disaster_id}`);
            setShowNotif(false);
        } catch (error) {
            console.error(error);
            alert("Error accepting invite.");
        }
    };

    return (
        <nav className="navbar animate-fade-in" style={{ position: 'relative', zIndex: 50 }}>
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

                <div className="nav-item" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotif(!showNotif)}>
                    <Bell className="nav-icon" />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: -5, right: -5,
                            background: '#ef4444', color: 'white',
                            fontSize: '10px', width: '16px', height: '16px',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {unreadCount}
                        </span>
                    )}

                    {/* Notification Dropdown */}
                    {showNotif && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0, width: '300px',
                            background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
                            padding: '1rem', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '0.8rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 100
                        }} onClick={e => e.stopPropagation()}>
                            <h4 style={{ margin: 0, color: 'white', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Notifications</h4>

                            {notifications.length === 0 ? (
                                <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>No notifications</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} style={{
                                        padding: '8px', borderRadius: '6px',
                                        background: n.is_read ? 'transparent' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid #333'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <strong style={{ color: 'white', fontSize: '0.9rem' }}>{n.title}</strong>
                                            {!n.is_read && <div style={{ w: 6, h: 6, bg: 'red', r: '50%' }} />}
                                        </div>
                                        <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0, marginBottom: '8px' }}>{n.message}</p>

                                        {n.type === 'invite' && !n.is_read && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleAcceptInvite(n)}
                                                    style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    Accept
                                                </button>
                                                <button onClick={() => markAsRead(n.id)} // Treat ignore as read for now
                                                    style={{ flex: 1, background: '#333', color: '#aaa', border: '1px solid #444', borderRadius: '4px', padding: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    Ignore
                                                </button>
                                            </div>
                                        )}
                                        {n.type !== 'invite' && !n.is_read && (
                                            <button onClick={() => markAsRead(n.id)}
                                                style={{ width: '100%', background: '#333', color: '#aaa', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
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
