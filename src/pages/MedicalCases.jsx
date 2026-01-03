import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Stethoscope, PlusCircle, Hospital } from 'lucide-react';

const MedicalCases = () => {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState(null);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PER_PAGE = 9;

    const fetchCases = async (pageNumber = 0) => {
        try {
            setLoading(true);
            const from = pageNumber * PER_PAGE;
            const to = from + PER_PAGE - 1;

            const { data, error } = await supabase
                .from('medical_cases')
                .select('id, title, hospital_name, condition, target_amount, collected_amount, image_url, is_urgent, created_at, severity')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            if (data.length < PER_PAGE) {
                setHasMore(false);
            }

            if (pageNumber === 0) {
                setCases(data || []);
            } else {
                setCases(prev => [...prev, ...data]);
            }
        } catch (error) {
            console.error('Error fetching medical cases:', error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch User Role
    useEffect(() => {
        const fetchRole = async () => {
            if (user) {
                const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (data) setUserRole(data.role);
            }
        };
        fetchRole();
    }, [user]);

    // Initial Fetch & Realtime Subscription
    useEffect(() => {
        fetchCases(0);

        const channel = supabase
            .channel('realtime-medical-feed')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'medical_cases' },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;
                    if (eventType === 'INSERT') {
                        setCases(prev => [newRecord, ...prev]);
                    } else if (eventType === 'UPDATE') {
                        setCases(prev => prev.map(c => c.id === newRecord.id ? newRecord : c));
                    } else if (eventType === 'DELETE') {
                        setCases(prev => prev.filter(c => c.id !== oldRecord.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCases(nextPage);
    };

    // Scroll Animation Logic
    const observer = useRef(
        new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, { threshold: 0.1 })
    );

    useEffect(() => {
        const hiddenElements = document.querySelectorAll('.hidden-card');
        hiddenElements.forEach((el) => observer.current.observe(el));
        return () => observer.current.disconnect();
    }, [cases]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}
        >
            <style>
                {`
                    .hidden-card {
                        opacity: 0;
                        transform: translateY(30px);
                        transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    }
                    .show {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .glass-hover:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                        border-color: #555 !important;
                    }
                    .progress-bar-fill {
                        transition: width 1.5s ease-out;
                    }
                `}
            </style>

            <div className="dashboard-layout" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    width: '100%',
                    paddingBottom: '1rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
                }}>
                    <h1 style={{
                        margin: 0,
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: '700',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                    }}>
                        <Stethoscope color="#6366f1" size={32} />
                        Active <span style={{ color: '#6366f1' }}>Medical Cases</span>
                    </h1>

                    {userRole === 'volunteer' && (
                        <Link to="/create-mission" state={{ type: 'medical' }} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1',
                            padding: '10px 20px', borderRadius: '30px',
                            border: '1px solid #6366f1', textDecoration: 'none', fontWeight: '600',
                            transition: 'all 0.2s'
                        }}>
                            <PlusCircle size={20} /> Report Medical Case
                        </Link>
                    )}
                </div>

                {errorMsg && (
                    <div style={{ padding: '1rem', background: '#451a1a', border: '1px solid #ef4444', color: '#ffaaaa', borderRadius: '8px', textAlign: 'center' }}>
                        Unable to load medical cases: {errorMsg}
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #333', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <>
                        {cases.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
                                <p style={{ fontSize: '1.1rem' }}>No active medical cases at this moment.</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                                gap: '2rem',
                                width: '100%'
                            }}>
                                {cases.map((d) => (
                                    <div
                                        key={d.id}
                                        className="hidden-card glass-hover"
                                        style={{
                                            background: '#1e1e1e',
                                            borderRadius: '16px',
                                            border: '1px solid #333',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                    >
                                        <div style={{
                                            height: '220px',
                                            width: '100%',
                                            backgroundImage: `url(${d.image_url || 'https://images.unsplash.com/photo-1516574187841-693083f69b72?auto=format&fit=crop&q=80'})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            position: 'relative'
                                        }}>
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }}></div>

                                            {d.is_urgent && (
                                                <span style={{
                                                    position: 'absolute', top: 12, right: 12,
                                                    background: '#dc2626', color: 'white',
                                                    padding: '6px 14px', borderRadius: '20px',
                                                    fontWeight: '700', fontSize: '0.75rem',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    URGENT HELP
                                                </span>
                                            )}

                                            <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ background: '#6366f1', padding: '4px', borderRadius: '50%', display: 'flex' }}>
                                                    <Hospital size={12} color="white" />
                                                </div>
                                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                                    {d.hospital_name || 'Unknown Hospital'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#f5f5f5', fontSize: '1.25rem', lineHeight: '1.4', fontWeight: '600' }}>
                                                {d.title}
                                            </h3>
                                            <p style={{ margin: '0 0 1rem 0', color: '#888', fontSize: '0.9rem' }}>
                                                {d.condition}
                                            </p>

                                            <div style={{ marginTop: 'auto' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#a3a3a3' }}>
                                                    <span>Raised</span>
                                                    <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{Math.round(((d.collected_amount || 0) / (d.target_amount || 1)) * 100)}%</span>
                                                </div>

                                                <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                                                    <div className="progress-bar-fill" style={{
                                                        width: `${Math.min(((d.collected_amount || 0) / (d.target_amount || 1)) * 100, 100)}%`,
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                                                        borderRadius: '4px'
                                                    }}></div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                                                    <span style={{ color: 'white' }}>৳{d.collected_amount || 0}</span>
                                                    <span style={{ color: '#666' }}>Goal: ৳{d.target_amount}</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <Link to={`/medical/${d.id}`} style={{
                                                        flex: 1,
                                                        textAlign: 'center',
                                                        background: '#6366f1', color: 'white', textDecoration: 'none',
                                                        padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '1rem',
                                                        transition: 'transform 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                                    }}>
                                                        Help Now
                                                    </Link>
                                                    <Link to={`/medical/${d.id}`} style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: '#2a2a2a', color: 'white', textDecoration: 'none',
                                                        padding: '0 16px', borderRadius: '8px',
                                                        border: '1px solid #444',
                                                        transition: 'background 0.2s'
                                                    }}>
                                                        <ArrowRight size={20} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {hasMore && !loading && cases.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                <button
                                    onClick={loadMore}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #444',
                                        color: '#aaa',
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', gap: '8px'
                                    }}
                                    className="hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
                                >
                                    Load More Cases <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default MedicalCases;
