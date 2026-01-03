/**
 * DisasterDetail View - Single disaster details page
 * This is a View in the MVC architecture
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
// Navbar import removed
import { MapPin, Users, DollarSign, ArrowLeft, Calendar } from 'lucide-react';

const DisasterDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get current user
    const [disaster, setDisaster] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [isVolunteer, setIsVolunteer] = useState(false); // Track status
    const [volunteerLoading, setVolunteerLoading] = useState(false);

    const fetchDisasterData = async () => {
        // 1. Fetch Disaster Details
        const { data, error } = await supabase
            .from('disasters')
            .select('*')
            .eq('id', id)
            .single();

        if (error) console.error(error);
        else setDisaster(data);

        // 2. Check if User is Volunteer (if logged in)
        if (user) {
            const { data: volData, error: volError } = await supabase
                .from('disaster_volunteers')
                .select('id')
                .eq('disaster_id', id)
                .eq('user_id', user.id)
                .maybeSingle();

            if (volError) {
                console.error("Error checking volunteer status:", volError);
            }

            setIsVolunteer(!!volData); // If null, false.
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchDisasterData();

        // Realtime Subscription
        const channel = supabase
            .channel(`disaster-${id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'disasters', filter: `id=eq.${id}` },
                () => fetchDisasterData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'disaster_volunteers', filter: `disaster_id=eq.${id}` },
                () => fetchDisasterData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, user]);

    const handleVolunteerToggle = async () => {
        if (!user) {
            alert("Please login to join as a volunteer.");
            // navigate('/login'); // Optional
            return;
        }

        setVolunteerLoading(true);
        try {
            if (isVolunteer) {
                // Leave
                const { error } = await supabase
                    .from('disaster_volunteers')
                    .delete()
                    .eq('disaster_id', id)
                    .eq('user_id', user.id);

                if (error) throw error;

                setIsVolunteer(false);
                setDisaster(prev => ({
                    ...prev,
                    assigned_volunteers_count: Math.max(0, (prev.assigned_volunteers_count || 0) - 1)
                }));
                alert("You have withdrawn from this volunteer effort.");
            } else {
                // Join
                const { error } = await supabase
                    .from('disaster_volunteers')
                    .insert([{ disaster_id: id, user_id: user.id }]);

                if (error) throw error;

                setIsVolunteer(true);
                setDisaster(prev => ({
                    ...prev,
                    assigned_volunteers_count: (prev.assigned_volunteers_count || 0) + 1
                }));
                alert("Thank you! You have joined as a volunteer.");
            }
        } catch (error) {
            console.error("Volunteer Error:", error);
            alert("Error updating volunteer status.");
        } finally {
            setVolunteerLoading(false);
        }
    };

    if (loading) return <div style={{ minHeight: '100vh', padding: '2rem', color: '#888' }}>Loading...</div>;
    if (!disaster) return <div style={{ minHeight: '100vh', padding: '2rem', color: 'white' }}>Disaster not found.</div>;

    const percentFunded = Math.min(((disaster.collected_amount || 0) / disaster.target_amount) * 100, 100);



    return (
        <div style={{ minHeight: '100vh' }}>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                <button onClick={() => navigate(-1)} style={{
                    background: 'transparent', border: 'none', color: '#888',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1rem'
                }}>
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{
                        height: '400px',
                        backgroundImage: `url(${disaster.image_url || 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                            padding: '2rem'
                        }}>
                            {disaster.is_urgent && (
                                <span style={{ background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem', display: 'inline-block', marginBottom: '10px' }}>URGENT ACTION REQUIRED</span>
                            )}
                            <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'white' }}>{disaster.title}</h1>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', marginTop: '10px' }}>
                                <MapPin size={18} /> {disaster.location}
                                <span style={{ margin: '0 10px' }}>|</span>
                                <Calendar size={18} /> Posted on {new Date(disaster.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div>
                            <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>About the Crisis</h2>
                            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '2rem' }}>{disaster.description || "No description provided."}</p>

                            {/* Gallery Section */}
                            {disaster.gallery && disaster.gallery.length > 0 && (
                                <div>
                                    <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem' }}>Photo Gallery</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                                        {disaster.gallery.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Gallery ${idx}`}
                                                onClick={() => setLightboxImage(img)}
                                                style={{
                                                    width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px',
                                                    cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #333'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', height: 'fit-content' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <p style={{ color: '#aaa', marginBottom: '5px' }}>Fundraising Progress</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>${disaster.collected_amount || 0}</span>
                                    <span style={{ color: '#666' }}>of ${disaster.target_amount}</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px' }}>
                                    <div style={{ width: `${percentFunded}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                                </div>
                                {disaster.status === 'completed' ? (
                                    <button disabled style={{ width: '100%', marginTop: '1rem', padding: '12px', background: '#333', color: '#aaa', border: '1px solid #444', borderRadius: '8px', fontWeight: 'bold', cursor: 'not-allowed' }}>
                                        Mission Completed
                                    </button>
                                ) : (
                                    <button onClick={() => setShowDonationModal(true)} style={{ width: '100%', marginTop: '1rem', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Donate Now
                                    </button>
                                )}
                            </div>

                            <div>
                                <p style={{ color: '#aaa', marginBottom: '5px' }}>Volunteer Needs</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Users size={24} color="#646cff" />
                                    <div>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{disaster.assigned_volunteers_count || 0}</span>
                                        <span style={{ color: '#666', marginLeft: '4px' }}>/ {disaster.volunteers_needed} volunteers joined</span>
                                    </div>
                                </div>
                                {disaster.status === 'completed' ? (
                                    <button disabled style={{ width: '100%', padding: '12px', background: '#333', color: '#aaa', border: '1px solid #444', borderRadius: '8px', fontWeight: 'bold', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        Mission Completed
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleVolunteerToggle}
                                        disabled={volunteerLoading}
                                        style={{
                                            width: '100%', padding: '12px',
                                            background: isVolunteer ? '#333' : '#646cff',
                                            color: isVolunteer ? '#aaa' : 'white',
                                            border: isVolunteer ? '1px solid #555' : 'none',
                                            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}>
                                        {volunteerLoading ? 'Processing...' : isVolunteer ? 'Joined (Click to Leave)' : 'Join as Volunteer'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    onClick={() => setLightboxImage(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
                    }}
                >
                    <img src={lightboxImage} alt="Full screen" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
                    <button
                        onClick={() => setLightboxImage(null)}
                        style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Donation Modal - bKash */}
            {showDonationModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center', background: '#222', border: '1px solid #333' }}>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: '60px', height: '60px', background: '#e2136e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                                ৳
                            </div>
                        </div>
                        <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Donate via bKash</h2>
                        <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            To donate, Send Money to the number below, then fill out the form for verification.
                        </p>

                        <div style={{ background: '#333', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed #555' }}>
                            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '5px' }}>Official bKash Number</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px', margin: 0 }}>
                                    {disaster.bkash_number || "Not Available"}
                                </p>
                                <button onClick={() => {
                                    navigator.clipboard.writeText(disaster.bkash_number || '');
                                    alert('Number copied to clipboard!');
                                }} style={{ background: 'transparent', border: 'none', color: '#e2136e', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Copy
                                </button>
                            </div>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const amountStr = formData.get('amount');
                            const phoneLast4 = formData.get('phone_last_4');

                            if (!amountStr || !phoneLast4) return alert("Please fill all fields");

                            const amount = parseFloat(amountStr);

                            // Get current user
                            const { data: { user } } = await supabase.auth.getUser();

                            const { error } = await supabase
                                .from('donations')
                                .insert([{
                                    disaster_id: disaster.id,
                                    user_id: user?.id || null,
                                    amount: amount,
                                    phone_last_4: phoneLast4,
                                    status: 'pending'
                                }]);

                            if (error) {
                                console.error("Donation Error:", error);
                                alert("Error submitting donation: " + error.message);
                            } else {
                                alert("Donation submitted for verification! Thank you.");
                                setShowDonationModal(false);
                            }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>

                            <div>
                                <label style={{ color: '#ccc', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Amount Sent (৳)</label>
                                <input name="amount" type="number" placeholder="e.g. 500" required
                                    style={{ width: '100%', padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                            </div>

                            <div>
                                <label style={{ color: '#ccc', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Last 4 Digits of Your Number</label>
                                <input name="phone_last_4" type="text" placeholder="e.g. 1234" maxLength="4" pattern="\d{4}" title="4 digits only" required
                                    style={{ width: '100%', padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowDonationModal(false)}
                                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit"
                                    style={{ flex: 1, padding: '12px', background: '#e2136e', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Confirm Donation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DisasterDetail;
