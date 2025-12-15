import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import { supabase } from '../supabaseClient';
import {
    User, Heart, AlertTriangle, Hand, Stethoscope, Users,
    ShoppingBag, Info, FileText, Bell, LogOut
} from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { getCartCount, toggleCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userRole, setUserRole] = useState(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUserRole();

            const channel = supabase
                .channel('realtime-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setNotifications(prev => [payload.new, ...prev]);
                            setUnreadCount(prev => prev + 1);
                        } else if (payload.eventType === 'DELETE') {
                            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                            fetchNotifications();
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchUserRole = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching user role:", error);
            return;
        }

        if (data) setUserRole(data.role);
    };

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
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting notification:", error);
            return;
        }

        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleAcceptInvite = async (notif) => {
        if (notif.type !== 'invite' || !notif.meta_data?.disaster_id) return;

        try {
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

    // Helper Component for Nav Items
    const NavItem = ({ to, icon: Icon, label, specialColor }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className="nav-item" style={{ position: 'relative', padding: '8px 12px', color: isActive ? 'white' : (specialColor || '#ccc') }}>
                {isActive && (
                    <motion.div
                        layoutId="active-nav-indicator"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '8px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            zIndex: -1
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Icon className="nav-icon" style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
            </Link>
        );
    };

    return (
        <>
            <nav className="navbar animate-fade-in" style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                width: '100%',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <Link to="/dashboard" className="nav-brand">
                    Relief Chain
                </Link>

                <div className="nav-links">
                    <LayoutGroup>
                        <NavItem to="/profile" icon={User} label="Profile" />
                        <NavItem to="/donations" icon={Heart} label="Donate" />
                        <NavItem to="/disasters" icon={AlertTriangle} label="Disasters" />
                        <NavItem to="/volunteer" icon={Hand} label="Volunteer" />
                        <NavItem to="/medical" icon={Stethoscope} label="Medical" />

                        {userRole === 'volunteer' ? (
                            <>
                                <NavItem to="/create-mission" icon={AlertTriangle} label="Lead Mission" specialColor="#10b981" />
                                <NavItem to="/volunteer-hub" icon={Users} label="Team Hub" specialColor="#6366f1" />
                            </>
                        ) : (
                            <NavItem to="/volunteer-application" icon={Hand} label="Join Core Team" specialColor="#6366f1" />
                        )}

                        <NavItem to="/shop" icon={ShoppingBag} label="Shop" />
                        <NavItem to="/about" icon={Info} label="About" />
                        <NavItem to="/policy" icon={FileText} label="Policy" />
                    </LayoutGroup>

                    {/* Cart Trigger */}
                    <div
                        className="nav-item"
                        style={{ position: 'relative', cursor: 'pointer', padding: '8px 12px' }}
                        onClick={toggleCart}
                    >
                        <ShoppingBag className="nav-icon" />
                        {getCartCount() > 0 && (
                            <span style={{
                                position: 'absolute', top: 0, right: 5,
                                background: '#6366f1', color: 'white',
                                fontSize: '10px', width: '16px', height: '16px',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {getCartCount()}
                            </span>
                        )}
                    </div>

                    <div className="nav-item" style={{ position: 'relative', cursor: 'pointer', padding: '8px 12px' }} onClick={() => setShowNotif(!showNotif)}>
                        <Bell className="nav-icon" />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 0, right: 5,
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
                                    notifications.map(n => ( // Simplified mapping based on existing logic
                                        <div key={n.id} style={{
                                            padding: '8px', borderRadius: '6px',
                                            background: n.is_read ? 'transparent' : 'rgba(255,255,255,0.05)',
                                            border: '1px solid #333'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <strong style={{ color: 'white', fontSize: '0.9rem' }}>{n.title}</strong>
                                                {!n.is_read && <div style={{ width: 6, height: 6, background: '#ef4444', borderRadius: '50%' }} />}
                                            </div>
                                            <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0, marginBottom: '8px' }}>{n.message}</p>

                                            {n.type === 'invite' && !n.is_read && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleAcceptInvite(n)}
                                                        style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                        Accept
                                                    </button>
                                                    <button onClick={() => markAsRead(n.id)}
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
                        style={{ background: 'transparent', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
                    >
                        <LogOut className="nav-icon" style={{ color: '#ff4d4f' }} />
                    </button>
                </div>
            </nav>
            <CartDrawer />
        </>
    );
};

export default Navbar;
