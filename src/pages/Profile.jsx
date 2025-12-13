import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { User, Mail, Heart, Clock, CheckCircle, XCircle } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [donations, setDonations] = useState([]);
    const [volunteerActivities, setVolunteerActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Profile Details
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) console.error('Error fetching profile:', profileError);
            else setProfile(profileData);

            // 2. Fetch User Donations
            const { data: donationData, error: donationError } = await supabase
                .from('donations')
                .select(`
                    *,
                    disasters (title, image_url)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (donationError) console.error('Error fetching donations:', donationError);
            else setDonations(donationData || []);

            // 3. Fetch Volunteer Activities
            const { data: volData, error: volError } = await supabase
                .from('disaster_volunteers')
                .select(`
                    *,
                    disasters (title, location, image_url, severity)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (volError) console.error('Error fetching volunteer data:', volError);
            else setVolunteerActivities(volData || []);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats
    const totalDonated = donations
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + Number(d.amount), 0);

    const campaignsSupported = new Set(donations.map(d => d.disaster_id)).size;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
                <style>{`.spinner { width: 40px; height: 40px; border: 3px solid #333; border-top-color: #ef4444; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
            <Navbar />

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2rem' }}>My Profile</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                    {/* Left Column: User Info & Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Profile Card */}
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', height: 'fit-content' }}>
                            <div style={{
                                width: '100px', height: '100px', background: '#333', borderRadius: '50%', margin: '0 auto 1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#666'
                            }}>
                                {profile?.full_name?.charAt(0).toUpperCase() || <User />}
                            </div>
                            <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{profile?.full_name || 'Volunteer'}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#888', fontSize: '0.9rem' }}>
                                <Mail size={16} /> {user.email}
                            </div>
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #333' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '4px' }}>Total Donated</p>
                                    <p style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: 'bold' }}>৳{totalDonated.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '4px' }}>Campaigns Supported</p>
                                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{campaignsSupported}</p>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '4px' }}>Completed Missions</p>
                                    <p style={{ color: '#6366f1', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {volunteerActivities.filter(v => v.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Donation History */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.4rem' }}>Donation History</h2>

                        {donations.length === 0 ? (
                            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                                <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <p>No donations yet. start making a difference today!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {donations.map(donation => (
                                    <div key={donation.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s' }}>
                                        {/* Status Icon */}
                                        <div style={{
                                            padding: '10px', borderRadius: '50%',
                                            background: donation.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : donation.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: donation.status === 'approved' ? '#10b981' : donation.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                        }}>
                                            {donation.status === 'approved' ? <CheckCircle size={24} /> : donation.status === 'rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 4px 0' }}>{donation.disasters?.title || 'Unknown Campaign'}</h3>
                                            <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
                                                {new Date(donation.created_at).toLocaleDateString()} at {new Date(donation.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>৳{donation.amount}</p>
                                            <span style={{
                                                fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold',
                                                color: donation.status === 'approved' ? '#10b981' : donation.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                            }}>
                                                {donation.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Volunteer History */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.4rem' }}>Volunteering Activities</h2>

                        {volunteerActivities.length === 0 ? (
                            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                                <User size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <p>You haven't joined any relief efforts yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {volunteerActivities.map(item => (
                                    <div key={item.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        {/* Image */}
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                                            <img
                                                src={item.disasters?.image_url || 'https://via.placeholder.com/60'}
                                                alt="Disaster"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 4px 0' }}>{item.disasters?.title || 'Unknown Disaster'}</h3>
                                            <p style={{ color: '#888', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <User size={14} /> Joined on {new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                                background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                                color: item.status === 'completed' ? '#10b981' : '#6366f1'
                                            }}>
                                                {item.status === 'completed' ? 'COMPLETED' : 'JOINED'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
