/**
 * NewsFeed Component (MVC Pattern)
 * View Layer - Handles news feed display and post creation UI
 */
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Share2, MessageCircle, Heart, Plus, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewsFeed = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // Create Post State
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchPosts();
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setProfile(data);
    };

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select(`*, profiles:author_id(full_name)`)
            .order('created_at', { ascending: false })
            .limit(3);

        if (!error) setPosts(data || []);
        setLoading(false);
    };

    const handleImageUpload = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('posts').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setUploading(true);

        try {
            let imageUrl = null;
            if (image) {
                imageUrl = await handleImageUpload(image);
            }

            const { error } = await supabase
                .from('posts')
                .insert([{
                    author_id: user.id,
                    content: content,
                    image_url: imageUrl
                }]);

            if (error) throw error;

            setContent('');
            setImage(null);
            setShowModal(false);
            fetchPosts(); // Refresh feed
        } catch (error) {
            console.error(error);
            alert('Error creating post');
        } finally {
            setUploading(false);
        }
    };

    const canCreatePost = profile?.role === 'volunteer' || profile?.role === 'admin';

    return (
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="section-title" style={{ margin: 0 }}>Latest Updates</h3>
                {canCreatePost && (
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            background: '#6366f1', border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white'
                        }}
                        title="Create Post"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>

            {loading ? <p style={{ color: '#666' }}>Loading updates...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {posts.length === 0 ? <p style={{ color: '#666' }}>No updates yet.</p> : posts.map(item => (
                        <div key={item.id} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold' }}>{item.profiles?.full_name || 'Volunteer'}</span>
                                <span style={{ color: '#666', fontSize: '0.85rem' }}>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p style={{ margin: '0 0 1rem 0', color: '#ddd', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                {item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content}
                            </p>
                            {item.image_url && (
                                <img src={item.image_url} alt="Post" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                            )}
                        </div>
                    ))}

                    <button
                        onClick={() => navigate('/volunteer-feed')}
                        style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', width: '100%', textAlign: 'center', paddingTop: '0.5rem' }}
                    >
                        See All Updates
                    </button>
                </div>
            )}

            {/* Create Post Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowModal(false)}>
                    <div style={{
                        background: '#1e1e1e', width: '90%', maxWidth: '500px', borderRadius: '12px', padding: '2rem',
                        border: '1px solid #333'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: 'white', margin: 0 }}>Create Update</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}><X /></button>
                        </div>

                        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <textarea
                                placeholder="What's happening?"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows="4"
                                style={{ padding: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: 'white', resize: 'vertical' }}
                            ></textarea>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                    padding: '8px 16px', background: '#2a2a2a', borderRadius: '8px', border: '1px solid #444', color: '#aaa'
                                }}>
                                    <ImageIcon size={18} />
                                    {image ? 'Image Selected' : 'Add Image'}
                                    <input type="file" accept="image/*" hidden onChange={e => setImage(e.target.files[0])} />
                                </label>
                                {image && <span style={{ color: '#6366f1', fontSize: '0.9rem' }}>{image.name}</span>}
                            </div>

                            <button type="submit" disabled={uploading}
                                style={{
                                    marginTop: '1rem', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px',
                                    fontWeight: 'bold', cursor: 'pointer', opacity: uploading ? 0.7 : 1
                                }}>
                                {uploading ? 'Posting...' : 'Post Update'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsFeed;
