import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Activity } from 'lucide-react';

const DisastersFeed = () => {
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PER_PAGE = 9; // Grid of 3x3

    const fetchDisasters = async (pageNumber = 0) => {
        try {
            setLoading(true);
            const from = pageNumber * PER_PAGE;
            const to = from + PER_PAGE - 1;

            const { data, error } = await supabase
                .from('disasters')
                .select('id, title, location, target_amount, collected_amount, image_url, is_urgent, created_at')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            if (data.length < PER_PAGE) {
                setHasMore(false);
            }

            if (pageNumber === 0) {
                setDisasters(data || []);
            } else {
                setDisasters(prev => [...prev, ...data]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 1. Initial Fetch
    useEffect(() => {
        fetchDisasters(0);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchDisasters(nextPage);
    };

    // 2. Scroll Animation Logic
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
    }, [disasters]);

    return (
        <div style={{ minHeight: '100vh', background: '#121212', fontFamily: 'Inter, sans-serif' }}>
            <Navbar />

            {/* CSS Styles for Animations */}
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

            {/* Main Container - Forced Flex Column to fix layout issues */}
            <div className="dashboard-layout" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem',
                display: 'flex',          // Ensure flex behavior
                flexDirection: 'column',  // FORCE Top-to-Bottom layout
                gap: '2rem'               // Space between Title and Grid
            }}>

                {/* 3. The Header (Compact & Centered) */}
                <div style={{
                    textAlign: 'center',
                    width: '100%',
                    paddingBottom: '1rem',
                    // Removed the borderBottom to make it look cleaner/less "boxy"
                }}>
                    <h1 style={{
                        margin: 0,
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: '700',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                    }}>
                        <Activity color="#ef4444" size={32} />
                        Active <span style={{ color: '#ef4444' }}>Relief Missions</span>
                    </h1>
                </div>

                {/* Error State */}
                {errorMsg && (
                    <div style={{ padding: '1rem', background: '#451a1a', border: '1px solid #ef4444', color: '#ffaaaa', borderRadius: '8px', textAlign: 'center' }}>
                        Unable to load missions: {errorMsg}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #333', borderTop: '3px solid #ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <>
                        {disasters.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
                                <p style={{ fontSize: '1.1rem' }}>No active relief missions at this moment.</p>
                            </div>
                        ) : (
                            /* 4. The Grid (Cards Below Heading) */
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', // Slightly wider cards
                                gap: '2rem',
                                width: '100%'
                            }}>
                                {disasters.map((d) => (
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
                                        {/* Card Image */}
                                        <div style={{
                                            height: '220px',
                                            width: '100%',
                                            backgroundImage: `url(${d.image_url || 'https://images.unsplash.com/photo-1603789506682-1c6449103e6d?auto=format&fit=crop&q=80'})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            position: 'relative'
                                        }}>
                                            {/* Gradient Overlay for Text Readability */}
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
                                                    URGENT
                                                </span>
                                            )}

                                            <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ background: '#ef4444', padding: '4px', borderRadius: '50%', display: 'flex' }}>
                                                    <MapPin size={12} color="white" />
                                                </div>
                                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                                    {d.location}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{ margin: '0 0 1rem 0', color: '#f5f5f5', fontSize: '1.25rem', lineHeight: '1.4', fontWeight: '600' }}>
                                                {d.title}
                                            </h3>

                                            {/* Stats & Progress */}
                                            <div style={{ marginTop: 'auto' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#a3a3a3' }}>
                                                    <span>Progress</span>
                                                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{Math.round(((d.collected_amount || 0) / (d.target_amount || 1)) * 100)}%</span>
                                                </div>

                                                <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                                                    <div className="progress-bar-fill" style={{
                                                        width: `${Math.min(((d.collected_amount || 0) / (d.target_amount || 1)) * 100, 100)}%`,
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, #ef4444, #f87171)',
                                                        borderRadius: '4px'
                                                    }}></div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                                                    <span style={{ color: 'white' }}>${d.collected_amount || 0}</span>
                                                    <span style={{ color: '#666' }}>Goal: ${d.target_amount}</span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <Link to={`/disasters/${d.id}`} style={{
                                                        flex: 1,
                                                        textAlign: 'center',
                                                        background: '#ef4444', color: 'white', textDecoration: 'none',
                                                        padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '1rem',
                                                        transition: 'transform 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                                    }}>
                                                        Donate
                                                    </Link>
                                                    <Link to={`/disasters/${d.id}`} style={{
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

                        {/* Load More Button */}
                        {hasMore && !loading && disasters.length > 0 && (
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
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = '#666';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = '#444';
                                        e.currentTarget.style.color = '#aaa';
                                    }}
                                >
                                    Load More Missions <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DisastersFeed;