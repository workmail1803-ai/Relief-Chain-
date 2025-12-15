import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// Navbar import removed
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VolunteerFeed = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (full_name, role)
            `)
            .order('created_at', { ascending: false })
            .limit(50); // Initial limit

        if (error) {
            console.error("Error fetching feed:", error);
        } else {
            setPosts(data || []);
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#121212', fontFamily: 'Inter, sans-serif' }}>


            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'transparent', border: 'none', color: '#888',
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        marginBottom: '2rem', fontSize: '1rem'
                    }}
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <h1 style={{ color: 'white', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    <span style={{ color: '#6366f1' }}>Volunteer</span> Updates
                </h1>

                {loading ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Loading feed...</p>
                ) : posts.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center' }}>No updates yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {posts.map(post => (
                            <div key={post.id} className="glass-card" style={{
                                background: '#1e1e1e', borderRadius: '12px', overflow: 'hidden',
                                border: '1px solid #333', padding: '1.5rem'
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%', background: '#333',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
                                    }}>
                                        {post.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>
                                            {post.profiles?.full_name || 'Unknown User'}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.8rem' }}>
                                            <span style={{
                                                background: post.profiles?.role === 'admin' ? '#ef4444' : '#6366f1',
                                                color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem'
                                            }}>
                                                {post.profiles?.role?.toUpperCase()}
                                            </span>
                                            <span>•</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} />
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <p style={{ color: '#e0e0e0', lineHeight: '1.6', fontSize: '1rem', marginTop: 0 }}>
                                    {post.content}
                                </p>

                                {/* Image */}
                                {post.image_url && (
                                    <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img
                                            src={post.image_url}
                                            alt="Post attachment"
                                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        <p style={{ textAlign: 'center', color: '#444', marginTop: '2rem', fontSize: '0.9rem' }}>
                            You've reached the end of the feed.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerFeed;
