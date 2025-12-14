import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Send, Search, MessageSquare } from 'lucide-react';

const VolunteerHub = () => {
    const { user } = useAuth();
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Chat State
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const bottomRef = useRef(null);

    // 1. Fetch Volunteers List
    useEffect(() => {
        const fetchVolunteers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'volunteer')
                .neq('id', user.id);

            if (!error) setVolunteers(data || []);
            setLoading(false);
        };
        fetchVolunteers();
    }, [user]);

    // 2. Fetch Messages when a user is selected
    useEffect(() => {
        if (!selectedVolunteer) return;

        const fetchMessages = async () => {
            setChatLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedVolunteer.id}),and(sender_id.eq.${selectedVolunteer.id},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true }); // Oldest first

            if (!error) setMessages(data || []);
            setChatLoading(false);
            scrollToBottom();
        };

        fetchMessages();

        // 3. Real-time Subscription for this chat
        const channel = supabase
            .channel(`chat-${user.id}-${selectedVolunteer.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=in.(${user.id},${selectedVolunteer.id})`
                },
                (payload) => {
                    const msg = payload.new;
                    // Check if this message belongs to the current conversation
                    if (
                        (msg.sender_id === user.id && msg.receiver_id === selectedVolunteer.id) ||
                        (msg.sender_id === selectedVolunteer.id && msg.receiver_id === user.id)
                    ) {
                        setMessages(prev => [...prev, msg]);
                        scrollToBottom();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedVolunteer, user]);

    const scrollToBottom = () => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedVolunteer) return;

        const content = newMessage.trim();
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            sender_id: user.id,
            receiver_id: selectedVolunteer.id,
            content: content,
            created_at: new Date().toISOString()
        };

        // 1. Optimistic Update (Instant UI)
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        scrollToBottom();

        // 2. Send to DB
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                sender_id: user.id,
                receiver_id: selectedVolunteer.id,
                content: content
            }])
            .select()
            .single();

        if (error) {
            console.error("Error sending:", error);
            alert("Failed to send message");
            // Rollback optimistic update on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        } else {
            // Replace temp message with real one (to get real ID/timestamp if needed)
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
        }
    };

    const filteredVolunteers = volunteers.filter(v =>
        v.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ height: '100vh', background: '#121212', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
            <Navbar />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '1rem', gap: '1rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

                {/* Left Sidebar: User List */}
                <div className="glass-card" style={{ width: '30%', minWidth: '280px', display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRight: '1px solid #333' }}>
                    <h2 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User color="#6366f1" /> Volunteers
                    </h2>

                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Search size={16} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', background: '#222', border: '1px solid #333', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {loading ? <p style={{ color: '#666', textAlign: 'center' }}>Loading...</p> :
                            filteredVolunteers.map(vol => (
                                <div
                                    key={vol.id}
                                    onClick={() => setSelectedVolunteer(vol)}
                                    style={{
                                        padding: '12px', borderRadius: '8px', cursor: 'pointer',
                                        background: selectedVolunteer?.id === vol.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                        border: selectedVolunteer?.id === vol.id ? '1px solid #6366f1' : '1px solid transparent',
                                        display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                                    }}
                                    className="hover-bg-dark"
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {vol.full_name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, color: 'white', fontSize: '0.95rem' }}>{vol.full_name}</h4>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>Volunteer</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Right Side: Chat Window */}
                <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    {selectedVolunteer ? (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #333', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {selectedVolunteer.full_name?.[0]?.toUpperCase()}
                                </div>
                                <h3 style={{ margin: 0, color: 'white' }}>{selectedVolunteer.full_name}</h3>
                            </div>

                            {/* Chat Area */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#161616' }}>
                                {chatLoading ? (
                                    <p style={{ textAlign: 'center', color: '#666' }}>Loading messages...</p>
                                ) : messages.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#444', marginTop: '2rem' }}>
                                        <MessageSquare size={48} style={{ opacity: 0.2 }} />
                                        <p>No messages yet. Say hello!</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMe = msg.sender_id === user.id;
                                        return (
                                            <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                                <div style={{
                                                    padding: '10px 16px',
                                                    borderRadius: '12px',
                                                    background: isMe ? '#6366f1' : '#333',
                                                    color: 'white',
                                                    borderBottomRightRadius: isMe ? '2px' : '12px',
                                                    borderBottomLeftRadius: isMe ? '12px' : '2px'
                                                }}>
                                                    {msg.content}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #333', background: '#1e1e1e', display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: 'white', outline: 'none' }}
                                />
                                <button type="submit" style={{ padding: '12px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            <MessageSquare size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <h2>Select a volunteer to chat</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerHub;
