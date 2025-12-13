import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { compressImage } from '../utils/imageUtils';
import {
    LayoutDashboard, AlertTriangle, Stethoscope, Users,
    ShoppingBag, DollarSign, LogOut, Plus, Search
} from 'lucide-react';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab />;
            case 'disasters':
                return <DisastersTab />;
            case 'medical':
                return <div className="glass-card p-6">Medical Management (Coming Soon)</div>;
            case 'users':
                return <div className="glass-card p-6">User & Volunteer Management (Coming Soon)</div>;
            case 'donations':
                return <DonationsTab />;
            case 'shop':
                return <div className="glass-card p-6">Merchandise Shop (Coming Soon)</div>;
            default:
                return <OverviewTab />;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#111' }}>
            {/* Sidebar */}
            <div style={{
                width: '260px',
                background: '#1a1a1a',
                borderRight: '1px solid #333',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{
                    fontSize: '1.5rem', fontWeight: 'bold',
                    background: 'linear-gradient(to right, #ef4444, #f87171)',
                    WebkitBackgroundClip: 'text', color: 'transparent',
                    marginBottom: '2rem'
                }}>
                    Admin Portal
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Overview"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <SidebarItem
                        icon={<AlertTriangle size={20} />}
                        label="Disasters"
                        active={activeTab === 'disasters'}
                        onClick={() => setActiveTab('disasters')}
                    />
                    <SidebarItem
                        icon={<Stethoscope size={20} />}
                        label="Medical Cases"
                        active={activeTab === 'medical'}
                        onClick={() => setActiveTab('medical')}
                    />
                    <SidebarItem
                        icon={<Users size={20} />}
                        label="Users & Volunteers"
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <SidebarItem
                        icon={<DollarSign size={20} />}
                        label="Donations"
                        active={activeTab === 'donations'}
                        onClick={() => setActiveTab('donations')}
                    />
                    <SidebarItem
                        icon={<ShoppingBag size={20} />}
                        label="Merchandise"
                        active={activeTab === 'shop'}
                        onClick={() => setActiveTab('shop')}
                    />
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                        padding: '12px', borderRadius: '8px', border: 'none',
                        cursor: 'pointer', fontWeight: '600', marginTop: 'auto'
                    }}
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {activeTab}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#888' }}>Administrator Mode</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ef4444' }}></div>
                    </div>
                </header>

                <div className="animate-fade-in">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

// Sub-components
const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '12px 16px',
            background: active ? '#ef4444' : 'transparent',
            color: active ? 'white' : '#888',
            border: 'none', borderRadius: '8px',
            cursor: 'pointer', transition: 'all 0.2s',
            fontSize: '0.95rem', fontWeight: active ? '600' : '400',
            textAlign: 'left'
        }}
    >
        {icon} {label}
    </button>
);

const OverviewTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Total Donations" value="$1.2M" color="#10b981" />
        <StatCard title="Active Volunteers" value="3,450" color="#6366f1" />
        <StatCard title="Active Disasters" value="12" color="#f59e0b" />
        <StatCard title="Pending Verifications" value="45" color="#ef4444" />
    </div>
);

const StatCard = ({ title, value, color }) => (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: color, margin: 0 }}>{value}</p>
    </div>
);

const DisastersTab = () => {
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        severity: 'medium',
        target_amount: '',
        volunteers_needed: '',
        description: '',
        is_urgent: false,
        is_urgent: false,
        image_url: '',
        gallery: [],
        bkash_number: ''
    });

    useEffect(() => {
        fetchDisasters();
    }, []);

    const fetchDisasters = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('disasters')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching disasters:', error);
        else setDisasters(data || []);
        setLoading(false);
    };

    const handleInteract = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            const newImageUrls = [];

            // Process all selected files
            for (const file of files) {
                // Compress raw file
                const compressedFile = await compressImage(file);

                const fileExt = compressedFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('disasters')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('disasters').getPublicUrl(filePath);
                newImageUrls.push(data.publicUrl);
            }

            // Update state:
            // - Set first image as main 'image_url' if none exists
            // - Append all to 'gallery'
            setFormData(prev => ({
                ...prev,
                image_url: prev.image_url || newImageUrls[0],
                gallery: [...(prev.gallery || []), ...newImageUrls]
            }));

            alert(`Successfully uploaded ${newImageUrls.length} photo(s)!`);
        } catch (error) {
            console.error(error);
            alert('Error uploading images: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, index) => index !== indexToRemove)
        }));
    };

    const startEdit = (disaster) => {
        setEditingId(disaster.id);
        setFormData({
            title: disaster.title,
            location: disaster.location,
            severity: disaster.severity || 'medium',
            target_amount: disaster.target_amount,
            volunteers_needed: disaster.volunteers_needed || 0,
            description: disaster.description || '',
            is_urgent: disaster.is_urgent,
            is_urgent: disaster.is_urgent,
            image_url: disaster.image_url || '',
            gallery: disaster.gallery || [],
            bkash_number: disaster.bkash_number || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = {
            ...formData,
            target_amount: parseFloat(formData.target_amount) || 0,
            volunteers_needed: parseInt(formData.volunteers_needed) || 0
        };

        let error;

        if (editingId) {
            // Update existing
            const { error: updateError } = await supabase
                .from('disasters')
                .update(submitData)
                .eq('id', editingId);
            error = updateError;
        } else {
            // Create new
            const { error: insertError } = await supabase
                .from('disasters')
                .insert([submitData]);
            error = insertError;
        }

        if (error) {
            alert('Error saving disaster: ' + error.message);
        } else {
            alert(editingId ? 'Disaster updated!' : 'Disaster created!');
            setShowForm(false);
            setEditingId(null);
            setFormData({ title: '', location: '', severity: 'medium', target_amount: '', volunteers_needed: '', description: '', is_urgent: false, image_url: '', gallery: [], bkash_number: '' });
            fetchDisasters();
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ title: '', location: '', severity: 'medium', target_amount: '', volunteers_needed: '', description: '', is_urgent: false, image_url: '', gallery: [], bkash_number: '' });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem' }}>Disaster Management</h2>
                <button
                    onClick={() => {
                        if (showForm) cancelForm();
                        else setShowForm(true);
                    }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: showForm ? '#333' : '#ef4444', color: 'white',
                        padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer'
                    }}>
                    {showForm ? 'Cancel' : (<><Plus size={18} /> Add Disaster</>)}
                </button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid #ef4444' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>{editingId ? 'Edit Disaster' : 'New Disaster'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Title</label>
                                <input name="title" value={formData.title} onChange={handleInteract} required
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Location</label>
                                <input name="location" value={formData.location} onChange={handleInteract} required
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Severity</label>
                                <select name="severity" value={formData.severity} onChange={handleInteract}
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Funds Needed ($)</label>
                                <input name="target_amount" type="number" value={formData.target_amount} onChange={handleInteract}
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Volunteers Needed</label>
                                <input name="volunteers_needed" type="number" value={formData.volunteers_needed} onChange={handleInteract}
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Images (Select Multiple)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading}
                                        style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                                    {uploading && <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>Uploading & Compressing...</span>}

                                    {/* Gallery Preview */}
                                    {formData.gallery && formData.gallery.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0' }}>
                                            {formData.gallery.map((img, idx) => (
                                                <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                                                    <img src={img} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #444' }} />
                                                    <button type="button" onClick={() => removeImage(idx)}
                                                        style={{
                                                            position: 'absolute', top: -5, right: -5, width: '20px', height: '20px',
                                                            background: 'red', color: 'white', border: 'none', borderRadius: '50%',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px'
                                                        }}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInteract} rows="3"
                                style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleInteract} id="urgent-check" />
                            <label htmlFor="urgent-check" style={{ color: '#ef4444', fontWeight: 'bold' }}>Mark as Urgent</label>
                        </div>

                        <button type="submit" disabled={uploading}
                            style={{ padding: '12px', background: uploading ? '#555' : '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {editingId ? 'Update Disaster' : 'Create Disaster Record'}
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-card" style={{ padding: '1rem' }}>
                {loading ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Loading disasters...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', color: '#888', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Title</th>
                                <th style={{ padding: '12px' }}>Location</th>
                                <th style={{ padding: '12px' }}>Severity</th>
                                <th style={{ padding: '12px' }}>Funds / Vols</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disasters.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No active disasters found.</td></tr>
                            ) : (
                                disasters.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '12px' }}>
                                            {item.title}
                                            {item.is_urgent && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>URGENT</span>}
                                        </td>
                                        <td style={{ padding: '12px' }}>{item.location}</td>
                                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                                            <span style={{
                                                color: item.severity === 'critical' ? '#ef4444' : item.severity === 'high' ? '#f59e0b' : 'white'
                                            }}>{item.severity}</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            ${item.collected_amount || 0} / ${item.target_amount} <br />
                                            <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{item.assigned_volunteers_count || 0} / {item.volunteers_needed} Vols</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button onClick={() => startEdit(item)}
                                                style={{ background: '#333', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};


const DonationsTab = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('donations')
            .select(`
                *,
                disasters (title)
            `)
            .order('created_at', { ascending: false });

        if (error) console.error("Error fetching donations:", error);
        else setDonations(data || []);
        setLoading(false);
    };

    const handleApproval = async (donationId, status, disasterId, amount) => {
        try {
            // 1. Update Donation Status
            const { error: updateError } = await supabase
                .from('donations')
                .update({ status })
                .eq('id', donationId);

            if (updateError) throw updateError;

            // 2. If Approved, update Disaster Funds
            if (status === 'approved') {
                // Fetch current amount first to be safe, or use RPC content if concurrency is high. 
                // For valid prototype: read -> calculate -> update
                const { data: disasterData, error: fetchError } = await supabase
                    .from('disasters')
                    .select('collected_amount')
                    .eq('id', disasterId)
                    .single();

                if (fetchError) throw fetchError;

                const newAmount = (disasterData.collected_amount || 0) + parseFloat(amount);

                const { error: fundError } = await supabase
                    .from('disasters')
                    .update({ collected_amount: newAmount })
                    .eq('id', disasterId);

                if (fundError) throw fundError;
            }

            alert(`Donation marked as ${status}`);
            fetchDonations(); // Refresh list
        } catch (error) {
            alert("Error updating donation: " + error.message);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Donation Verification</h2>
            <div className="glass-card" style={{ padding: '1rem' }}>
                {loading ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Loading donations...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', color: '#888', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Date</th>
                                <th style={{ padding: '12px' }}>Disaster</th>
                                <th style={{ padding: '12px' }}>Amount</th>
                                <th style={{ padding: '12px' }}>Last 4 Digits</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donations.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No donation records found.</td></tr>
                            ) : (
                                donations.map(d => (
                                    <tr key={d.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#aaa' }}>
                                            {new Date(d.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {d.disasters?.title || 'Unknown'}
                                        </td>
                                        <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>
                                            ৳{d.amount}
                                        </td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                                            {d.phone_last_4}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                background: d.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : d.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                color: d.status === 'approved' ? '#10b981' : d.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                            }}>
                                                {d.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {d.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleApproval(d.id, 'approved', d.disaster_id, d.amount)}
                                                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleApproval(d.id, 'rejected', d.disaster_id, d.amount)}
                                                        style={{ background: '#333', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
