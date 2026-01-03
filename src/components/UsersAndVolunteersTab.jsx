/**
 * UsersAndVolunteersTab Component (MVC Pattern)
 * View Layer - Admin panel for volunteer management
 */
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Plus, Send, X } from 'lucide-react';

const UsersAndVolunteersTab = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(true);

    // Removed aggressive auto-reload failsafe

    // UI States
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // For messaging

    // Form States
    const [inviteEmail, setInviteEmail] = useState('');
    const [selectedDisasterId, setSelectedDisasterId] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel('realtime-volunteers')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'disaster_volunteers' },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: volData, error: volError } = await supabase
                .from('disaster_volunteers')
                .select(`*, profiles(full_name, email, phone_number), disasters(title)`)
                .order('created_at', { ascending: false });

            if (volError) console.error("Error fetching volunteers:", volError);
            else setVolunteers(volData || []);

            const { data: disData } = await supabase
                .from('disasters')
                .select('id, title')
                .order('created_at', { ascending: false });
            setDisasters(disData || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleInvite = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            // 1. Get User ID from Email
            const { data: userId, error: lookupError } = await supabase.rpc('get_user_id_by_email', { user_email: inviteEmail });

            if (lookupError || !userId) {
                alert("User not found with this email.");
                setProcessing(false);
                return;
            }

            // 2. Check if already invited/joined
            const { data: existing } = await supabase
                .from('disaster_volunteers')
                .select('id')
                .eq('user_id', userId)
                .eq('disaster_id', selectedDisasterId)
                .single();

            if (existing) {
                alert("User is already assigned to this disaster.");
                setProcessing(false);
                return;
            }

            // 3. Insert into disaster_volunteers (Status: invite_pending)
            const { error: insertError } = await supabase
                .from('disaster_volunteers')
                .insert([{
                    user_id: userId,
                    disaster_id: selectedDisasterId,
                    status: 'invited'
                }]);

            if (insertError) throw insertError;

            // 4. Send Notification
            const { error: notifError } = await supabase
                .from('notifications')
                .insert([{
                    user_id: userId,
                    title: 'New Volunteer Invite',
                    message: 'You have been invited to join a relief effort.',
                    type: 'invite',
                    meta_data: { disaster_id: selectedDisasterId }
                }]);

            if (notifError) console.error("Notification failed:", notifError);

            alert("Invite sent successfully!");
            setShowInviteModal(false);
            setInviteEmail('');
            fetchData(); // Refresh list

        } catch (error) {
            console.error(error);
            alert("Error sending invite: " + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setProcessing(true);

        try {
            const { error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: selectedUser.user_id,
                    title: 'Message from Admin',
                    message: messageContent,
                    type: 'message'
                }]);

            if (error) throw error;

            alert("Message sent!");
            setShowMessageModal(false);
            setMessageContent('');
            setSelectedUser(null);
        } catch (error) {
            alert("Error sending message: " + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleVerify = async (id, currentStatus) => {
        if (currentStatus === 'completed') return;
        const { error } = await supabase
            .from('disaster_volunteers')
            .update({ status: 'completed' })
            .eq('id', id);

        if (error) alert("Error: " + error.message);
        else {
            alert("Marked as completed!");
            fetchData();
        }
    };

    // --- UI Helpers ---
    const openMessageModal = (volunteer) => {
        setSelectedUser(volunteer);
        setShowMessageModal(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Volunteer Mission Management</h2>
                <button onClick={() => setShowInviteModal(true)}
                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Invite Volunteer
                </button>
            </div>

            <div className="glass-card" style={{ padding: '1rem' }}>
                {loading ? <p style={{ color: '#888', textAlign: 'center' }}>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', color: '#888', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Volunteer</th>
                                <th style={{ padding: '12px' }}>Mission</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {volunteers.map(v => (
                                <tr key={v.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{v.profiles?.full_name || 'User'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{v.profiles?.email}</div>
                                    </td>
                                    <td style={{ padding: '12px' }}>{v.disasters?.title}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                            background: v.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : v.status === 'invited' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                            color: v.status === 'completed' ? '#10b981' : v.status === 'invited' ? '#f59e0b' : '#6366f1'
                                        }}>
                                            {v.status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                                        {v.status !== 'completed' && (
                                            <button onClick={() => handleVerify(v.id, v.status)}
                                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                Verify
                                            </button>
                                        )}
                                        <button onClick={() => openMessageModal(v)}
                                            style={{ background: '#333', color: '#aaa', border: '1px solid #444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                            <Mail size={14} /> Msg
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '400px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'white' }}>Invite Volunteer</h3>
                            <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem' }}>User Email</label>
                                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required placeholder="user@example.com"
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px', marginTop: '4px' }} />
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Assign Disaster</label>
                                <select value={selectedDisasterId} onChange={e => setSelectedDisasterId(e.target.value)} required
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px', marginTop: '4px' }}>
                                    <option value="">Select a disaster...</option>
                                    {disasters.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                </select>
                            </div>
                            <button disabled={processing} style={{ padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                                {processing ? 'Sending...' : 'Send Invite'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '400px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'white' }}>Message {selectedUser?.profiles?.full_name}</h3>
                            <button onClick={() => setShowMessageModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <textarea value={messageContent} onChange={e => setMessageContent(e.target.value)} required placeholder="Type your message..." rows={4}
                                style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            <button disabled={processing} style={{ padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                {processing ? 'Sending...' : <><Send size={16} /> Send Message</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersAndVolunteersTab;
