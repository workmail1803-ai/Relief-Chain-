/**
 * AdminDashboard View - Admin control panel
 * This is a View in the MVC architecture
 * Follows MVC pattern - uses controllers for business logic
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { compressImage } from '../utils/imageUtils';
import UsersAndVolunteersTab from '../components/UsersAndVolunteersTab';
import {
    LayoutDashboard, AlertTriangle, Stethoscope, Users,
    ShoppingBag, DollarSign, LogOut, Plus, Search, FileText,
    TrendingUp, Clock, Activity, Heart
} from 'lucide-react';

import AdminShop from './AdminShop';

// Import controllers for MVC pattern
import {
    useAdminOverviewController
} from '../controllers/useAdminDashboardController';

// Import models for direct data operations where needed
import * as disasterModel from '../models/disasterModel';
import * as medicalModel from '../models/medicalModel';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab />;
            case 'disasters':
                return <DisastersTab />;
            case 'medical':
                return <MedicalTab />;
            case 'funds':
                return <FundsTab />;
            case 'users':
                return <UsersAndVolunteersTab />;
            case 'applications':
                return <VolunteerApplicationsTab />;
            case 'donations':
                return <DonationsTab />;
            case 'shop':
                return <AdminShop />;
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
                        label={<span>Users & Volunteers</span>}
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <SidebarItem
                        icon={<FileText size={20} />}
                        label="Applications"
                        active={activeTab === 'applications'}
                        onClick={() => setActiveTab('applications')}
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

const OverviewTab = () => {
    // Use the admin overview controller for stats
    const { stats, recentActivity, loading } = useAdminOverviewController();

    return (
        <div>
            {/* Main Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Total Donations"
                    value={`৳${stats.totalDonations.toLocaleString()}`}
                    color="#10b981"
                    icon={<TrendingUp size={20} />}
                    loading={loading}
                />
                <StatCard
                    title="Active Volunteers"
                    value={stats.activeVolunteers.toLocaleString()}
                    color="#6366f1"
                    icon={<Users size={20} />}
                    loading={loading}
                />
                <StatCard
                    title="Active Disasters"
                    value={stats.activeDisasters.toString()}
                    color="#f59e0b"
                    icon={<AlertTriangle size={20} />}
                    loading={loading}
                />
                <StatCard
                    title="Medical Cases"
                    value={stats.activeMedicalCases.toString()}
                    color="#ef4444"
                    icon={<Heart size={20} />}
                    loading={loading}
                />
            </div>

            {/* Pending Items Row */}
            <h3 style={{ color: '#888', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} /> Pending Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <PendingCard
                    title="Pending Donations"
                    value={stats.pendingDonations}
                    color="#f59e0b"
                    loading={loading}
                />
                <PendingCard
                    title="Pending Applications"
                    value={stats.pendingApplications}
                    color="#8b5cf6"
                    loading={loading}
                />
                <PendingCard
                    title="Pending Disasters"
                    value={stats.pendingDisasters}
                    color="#f97316"
                    loading={loading}
                />
                <PendingCard
                    title="Pending Medical"
                    value={stats.pendingMedicalCases}
                    color="#ec4899"
                    loading={loading}
                />
            </div>

            {/* Recent Activity */}
            <h3 style={{ color: '#888', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} /> Recent Donations
            </h3>
            <div className="glass-card" style={{ padding: '1rem' }}>
                {loading ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Loading recent activity...</p>
                ) : recentActivity.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center' }}>No recent donations</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', color: '#888', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Date</th>
                                <th style={{ padding: '8px' }}>Disaster</th>
                                <th style={{ padding: '8px' }}>Amount</th>
                                <th style={{ padding: '8px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map(donation => (
                                <tr key={donation.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                                        {new Date(donation.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        {donation.disasters?.title || 'General Fund'}
                                    </td>
                                    <td style={{ padding: '8px', color: '#10b981', fontWeight: 'bold' }}>
                                        ৳{donation.amount}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                                            background: donation.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' :
                                                donation.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                            color: donation.status === 'approved' ? '#10b981' :
                                                donation.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                        }}>
                                            {donation.status?.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// Enhanced StatCard with loading state and icon
const StatCard = ({ title, value, color, icon, loading = false }) => (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h3 style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>{title}</h3>
            {icon && <span style={{ color: color, opacity: 0.7 }}>{icon}</span>}
        </div>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: color, margin: 0 }}>
            {loading ? (
                <span style={{ opacity: 0.5 }}>...</span>
            ) : value}
        </p>
    </div>
);

// Compact card for pending items
const PendingCard = ({ title, value, color, loading = false }) => (
    <div className="glass-card" style={{
        padding: '1rem',
        borderLeft: `3px solid ${color}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{title}</span>
        <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: value > 0 ? color : '#666',
            minWidth: '40px',
            textAlign: 'right'
        }}>
            {loading ? '...' : value}
        </span>
    </div>
);

const DisastersTab = () => {
    const [disasters, setDisasters] = useState([]);
    const [pendingDisasters, setPendingDisasters] = useState([]);
    const [loading, setLoading] = useState(true);

    // Removed aggressive auto-reload failsafe
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PER_PAGE = 10;

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        severity: 'medium',
        target_amount: '',
        volunteers_needed: '',
        description: '',
        is_urgent: false,
        image_url: '',
        gallery: [],
        bkash_number: ''
    });

    useEffect(() => {
        fetchDisasters(0);

        const channel = supabase
            .channel('admin-realtime-disasters')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'disasters' },
                () => fetchDisasters(0)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchDisasters = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const from = pageNumber * PER_PAGE;
            const to = from + PER_PAGE - 1;


            // Fetch Pending
            const { data: pendingData } = await supabase.from('disasters').select('*').eq('status', 'pending');
            setPendingDisasters(pendingData || []);

            const { data, error } = await supabase
                .from('disasters')
                .select('id, title, location, severity, target_amount, collected_amount, assigned_volunteers_count, volunteers_needed, is_urgent, created_at, status')
                .neq('status', 'pending') // Fetch all non-pending (active/completed)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                console.error('Error fetching disasters:', error);
            } else {
                if (data.length < PER_PAGE) setHasMore(false);

                if (pageNumber === 0) {
                    setDisasters(data || []);
                } else {
                    setDisasters(prev => [...prev, ...data]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchDisasters(nextPage);
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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this disaster? This action cannot be undone.")) return;

        try {
            // Delete dependent records first (Simulating CASCADE)
            await supabase.from('donations').delete().eq('disaster_id', id);
            await supabase.from('disaster_volunteers').delete().eq('disaster_id', id);
            // Optionally delete notifications/messages if linked to disaster (schema doesn't imply strong link mostly)

            const { error } = await supabase
                .from('disasters')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchDisasters();
        } catch (error) {
            alert("Error deleting: " + error.message);
        }
    };

    const handleMarkComplete = async (id) => {
        if (!window.confirm("Mark as completed? This will disable further donations and volunteering.")) return;

        const { error } = await supabase
            .from('disasters')
            .update({ status: 'completed' })
            .eq('id', id);

        if (error) alert("Error updating status: " + error.message);
        else fetchDisasters();
    };

    const handleApprove = async (id) => {
        const { error } = await supabase
            .from('disasters')
            .update({ status: 'active' })
            .eq('id', id);

        if (error) alert("Error: " + error.message);
        else fetchDisasters();
    }

    const handleReject = async (id) => {
        if (!window.confirm("Reject this mission report?")) return;
        const { error } = await supabase.from('disasters').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else fetchDisasters();
    }

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

                        {/* Added bKash Number Field */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>bKash Number (Agent/Personal)</label>
                            <input name="bkash_number" value={formData.bkash_number} onChange={handleInteract} placeholder="e.g. 017xxxxxxxx"
                                style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
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

            {pendingDisasters.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle /> Pending Approvals ({pendingDisasters.length})
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {pendingDisasters.map(p => (
                            <div key={p.id} className="glass-card" style={{ padding: '1rem', border: '1px solid #f59e0b', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <img src={p.image_url} alt="Proof" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{p.title}</h4>
                                    <p style={{ margin: '4px 0', color: '#aaa', fontSize: '0.9rem' }}>{p.location} • {p.severity}</p>
                                    <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>by User</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button onClick={() => handleApprove(p.id)} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                                    <button onClick={() => handleReject(p.id)} style={{ padding: '8px 16px', background: '#333', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
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
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => startEdit(item)}
                                                    style={{ background: '#333', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Edit
                                                </button>
                                                {item.status !== 'completed' && (
                                                    <button onClick={() => handleMarkComplete(item.id)}
                                                        style={{ background: '#6366f1', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Complete
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(item.id)}
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
                {hasMore && !loading && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button onClick={loadMore} style={{ background: 'transparent', border: '1px solid #444', color: '#888', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                            Load More Results
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const DonationsTab = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Removed aggressive auto-reload failsafe
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PER_PAGE = 20;

    useEffect(() => {
        fetchDonations(0);

        const channel = supabase
            .channel('realtime-donations')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'donations' },
                () => {
                    // Easier to re-fetch to get the foreign key data (disaster title) populated correctly
                    // Optimistic updates are harder with joins without complex logic
                    fetchDonations(0);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchDonations = async (pageNumber = 0) => {
        try {
            setLoading(true);
            const from = pageNumber * PER_PAGE;
            const to = from + PER_PAGE - 1;

            const { data, error } = await supabase
                .from('donations')
                .select(`
                    *,
                    disasters (title)
                `)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                console.error("Error fetching donations:", error);
                // Fallback: If join failed, try fetching without join
                if (error.code === 'PGRST200') { // Generic embedding error code often
                    console.warn("Retrying without disaster join...");
                    const { data: retryData, error: retryError } = await supabase
                        .from('donations')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .range(from, to);

                    if (!retryError) {
                        // Manually populate headers if needed or just show basic info
                        processData(retryData, pageNumber);
                        return;
                    }
                }
            } else {
                processData(data, pageNumber);
            }
        } catch (err) {
            console.error("Unexpected error fetching donations:", err);
        } finally {
            setLoading(false);
        }
    };

    const processData = (data, pageNumber) => {
        if (data.length < PER_PAGE) setHasMore(false);

        if (pageNumber === 0) {
            setDonations(data || []);
        } else {
            setDonations(prev => {
                const existingIds = new Set(prev.map(d => d.id));
                const newItems = data.filter(d => !existingIds.has(d.id));
                return [...prev, ...newItems];
            });
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchDonations(nextPage);
    };

    const handleApproval = async (donation, status) => {
        try {
            // 1. Update Donation Status
            const { error: updateError } = await supabase
                .from('donations')
                .update({ status })
                .eq('id', donation.id);

            if (updateError) throw updateError;

            // 2. If Approved, update Funds
            if (status === 'approved') {
                const amount = parseFloat(donation.amount);

                if (donation.disaster_id) {
                    // Update Disaster Funds
                    const { data: disasterData, error: fetchError } = await supabase
                        .from('disasters')
                        .select('collected_amount')
                        .eq('id', donation.disaster_id)
                        .single();

                    if (fetchError) throw fetchError;

                    const newAmount = (disasterData.collected_amount || 0) + amount;
                    const { error: fundError } = await supabase
                        .from('disasters')
                        .update({ collected_amount: newAmount })
                        .eq('id', donation.disaster_id);

                    if (fundError) throw fundError;

                } else if (donation.donation_type === 'medical' || (donation.transaction_id && donation.transaction_id.startsWith('MEDICAL:'))) {
                    // Update Medical Case Funds
                    let medicalId = null;
                    if (donation.transaction_id && donation.transaction_id.startsWith('MEDICAL:')) {
                        medicalId = donation.transaction_id.split(':')[1];
                    }

                    if (medicalId) {
                        const { data: medData, error: medFetchError } = await supabase
                            .from('medical_cases')
                            .select('collected_amount')
                            .eq('id', medicalId)
                            .single();

                        if (!medFetchError && medData) {
                            const newMedAmount = (medData.collected_amount || 0) + amount;
                            await supabase.from('medical_cases').update({ collected_amount: newMedAmount }).eq('id', medicalId);
                        }
                    }
                }
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
                                            {d.disasters?.title || (d.donation_type === 'medical' ? 'Medical Donation' : (d.donation_type === 'general' ? 'General Donation' : 'General Donation'))}
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
                                                    <button onClick={() => handleApproval(d, 'approved')}
                                                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleApproval(d, 'rejected')}
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
                {hasMore && !loading && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button onClick={loadMore} style={{ background: 'transparent', border: '1px solid #444', color: '#888', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                            Load More Donations
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const VolunteerApplicationsTab = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Removed aggressive auto-reload failsafe

    useEffect(() => {
        fetchApplications();

        const channel = supabase
            .channel('realtime-applications')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'volunteer_applications' },
                () => fetchApplications()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('volunteer_applications')
                .select(`
                    *,
                    profiles (full_name, email, role)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error(error);
            } else {
                setApplications(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (appId, status, userId) => {
        try {
            // 1. Update Application Status
            const { error: appError } = await supabase
                .from('volunteer_applications')
                .update({ status })
                .eq('id', appId);

            if (appError) throw appError;

            // 2. If Approved, Check Role and Update if necessary
            if (status === 'approved') {
                // Fetch current role first
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();

                // Only upgrade to volunteer if they are NOT already an admin
                if (profile?.role !== 'admin') {
                    const { error: roleError } = await supabase
                        .from('profiles')
                        .update({ role: 'volunteer' })
                        .eq('id', userId);

                    if (roleError) throw roleError;
                }
            }

            alert(`Application ${status}!`);
            fetchApplications();
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Core Team Applications</h2>
            <div className="glass-card" style={{ padding: '1rem' }}>
                {loading ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Loading applications...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', color: '#888', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Applicant</th>
                                <th style={{ padding: '12px' }}>Skills</th>
                                <th style={{ padding: '12px' }}>Motivation</th>
                                <th style={{ padding: '12px' }}>Availability</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No pending applications.</td></tr>
                            ) : (
                                applications.map(app => (
                                    <tr key={app.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 'bold', color: 'white' }}>{app.profiles?.full_name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{app.profiles?.email}</div>
                                            {app.profiles?.role === 'volunteer' && <div style={{ fontSize: '0.7rem', color: '#10b981' }}>(Already Volunteer)</div>}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#ccc' }}>{app.skills}</td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#ccc' }}>{app.motivation}</td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#ccc' }}>{app.availability}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                background: app.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                color: app.status === 'approved' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                            }}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {app.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleAction(app.id, 'approved', app.user_id)}
                                                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleAction(app.id, 'rejected', app.user_id)}
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

const MedicalTab = () => {
    const [cases, setCases] = useState([]);
    const [pendingCases, setPendingCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PER_PAGE = 10;

    const [formData, setFormData] = useState({
        title: '',
        patient_name: '',
        hospital_name: '',
        condition: '', // Medical condition
        severity: 'medium',
        target_amount: '',
        description: '',
        is_urgent: false,
        image_url: '',
        gallery: [],
        bkash_number: '',
        documents_url: ''
    });

    useEffect(() => {
        fetchCases(0);

        const channel = supabase
            .channel('admin-realtime-medical')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'medical_cases' },
                () => fetchCases(0)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchCases = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const from = pageNumber * PER_PAGE;
            const to = from + PER_PAGE - 1;

            // Fetch Pending
            const { data: pendingData } = await supabase.from('medical_cases').select('*').eq('status', 'pending');
            setPendingCases(pendingData || []);

            // Fetch Active/Completed
            const { data, error } = await supabase
                .from('medical_cases')
                .select('*')
                .neq('status', 'pending')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) console.error(error);
            else {
                if (data.length < PER_PAGE) setHasMore(false);
                if (pageNumber === 0) setCases(data || []);
                else setCases(prev => [...prev, ...data]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCases(nextPage);
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
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            const newImageUrls = [];
            for (const file of files) {
                const compressedFile = await compressImage(file); // Reusing utility
                const fileExt = compressedFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('medical')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('medical').getPublicUrl(filePath);
                newImageUrls.push(data.publicUrl);
            }

            setFormData(prev => ({
                ...prev,
                image_url: prev.image_url || newImageUrls[0],
                gallery: [...(prev.gallery || []), ...newImageUrls]
            }));
            alert(`Uploaded ${newImageUrls.length} file(s).`);
        } catch (error) {
            console.error(error);
            alert("Upload error: " + error.message);
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            title: item.title,
            patient_name: item.patient_name || '',
            hospital_name: item.hospital_name || '',
            condition: item.condition || '',
            severity: item.severity || 'medium',
            target_amount: item.target_amount,
            description: item.description || '',
            is_urgent: item.is_urgent,
            image_url: item.image_url || '',
            gallery: item.gallery || [],
            bkash_number: item.bkash_number || '',
            documents_url: item.documents_url || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            target_amount: parseFloat(formData.target_amount) || 0
        };

        if (editingId) {
            const { error } = await supabase.from('medical_cases').update(submitData).eq('id', editingId);
            if (error) alert(error.message);
            else { alert('Updated!'); setShowForm(false); setEditingId(null); fetchCases(0); }
        } else {
            // Admin creating directly
            const { error } = await supabase.from('medical_cases').insert([{ ...submitData, status: 'active', volunteers_needed: 0 }]); // active by default if admin creates
            if (error) alert(error.message);
            else { alert('Created!'); setShowForm(false); fetchCases(0); }
        }
    };

    const handleApprove = async (id) => {
        const { error } = await supabase.from('medical_cases').update({ status: 'active' }).eq('id', id);
        if (error) alert(error.message);
        else fetchCases(0);
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject and delete this case?")) return;
        const { error } = await supabase.from('medical_cases').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchCases(0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this case permanently?")) return;
        const { error } = await supabase.from('medical_cases').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchCases(0);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem' }}>Medical Case Management</h2>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: '', patient_name: '', hospital_name: '', condition: '', severity: 'medium', target_amount: '', description: '', is_urgent: false, image_url: '', gallery: [], bkash_number: '', documents_url: '' }); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: showForm ? '#333' : '#6366f1', color: 'white',
                        padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer'
                    }}>
                    {showForm ? 'Cancel' : (<><Plus size={18} /> Add Medical Case</>)}
                </button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid #6366f1' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Title</label>
                                <input name="title" value={formData.title} onChange={handleInteract} required
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Patient Name</label>
                                <input name="patient_name" value={formData.patient_name} onChange={handleInteract} required
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Hospital</label>
                                <input name="hospital_name" value={formData.hospital_name} onChange={handleInteract} required
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Condition</label>
                                <input name="condition" value={formData.condition} onChange={handleInteract} required
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Funds Needed</label>
                                <input name="target_amount" type="number" value={formData.target_amount} onChange={handleInteract} required
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
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
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>bKash Number</label>
                                <input name="bkash_number" value={formData.bkash_number} onChange={handleInteract}
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Images (Select Multiple)</label>
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload}
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInteract} rows="3"
                                style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleInteract} id="med-urgent" />
                            <label htmlFor="med-urgent" style={{ color: '#ef4444', fontWeight: 'bold' }}>Mark as Urgent</label>
                        </div>

                        <button type="submit" style={{ padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {editingId ? 'Update Case' : 'Create Case'}
                        </button>
                    </form>
                </div>
            )}

            {pendingCases.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle /> Pending Medical Approvals ({pendingCases.length})
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {pendingCases.map(p => (
                            <div key={p.id} className="glass-card" style={{ padding: '1rem', border: '1px solid #f59e0b', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <img src={p.image_url} alt="Proof" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{p.title}</h4>
                                    <p style={{ margin: '4px 0', color: '#aaa', fontSize: '0.9rem' }}>{p.patient_name} @ {p.hospital_name}</p>
                                    <p style={{ margin: 0, color: '#f59e0b', fontSize: '0.8rem' }}>Condition: {p.condition}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button onClick={() => handleApprove(p.id)} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                                    <button onClick={() => handleReject(p.id)} style={{ padding: '8px 16px', background: '#333', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="glass-card" style={{ padding: '1rem' }}>
                {loading ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Loading medical cases...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', color: '#888', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Title</th>
                                <th style={{ padding: '12px' }}>Patient</th>
                                <th style={{ padding: '12px' }}>Hospital</th>
                                <th style={{ padding: '12px' }}>Fund Status</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cases.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No active medical cases.</td></tr>
                            ) : (
                                cases.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '12px' }}>
                                            {item.title}
                                            {item.is_urgent && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>URGENT</span>}
                                        </td>
                                        <td style={{ padding: '12px' }}>{item.patient_name}</td>
                                        <td style={{ padding: '12px' }}>{item.hospital_name}</td>
                                        <td style={{ padding: '12px' }}>
                                            ${item.collected_amount || 0} / ${item.target_amount}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => startEdit(item)}
                                                    style={{ background: '#333', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(item.id)}
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
                {hasMore && !loading && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button onClick={loadMore} style={{ background: 'transparent', border: '1px solid #444', color: '#888', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                            Load More Results
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const FundsTab = () => {
    const [generalFund, setGeneralFund] = useState(0);
    const [zakatFund, setZakatFund] = useState(0);
    const [activeMissions, setActiveMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Allocation Form
    const [selectedMission, setSelectedMission] = useState('');
    const [allocationAmount, setAllocationAmount] = useState('');
    const [mpType, setMpType] = useState('general'); // 'general' or 'zakat'

    useEffect(() => {
        fetchFunds();
        fetchActiveMissions();
    }, []);

    const fetchFunds = async () => {
        // Calculate General Fund Balance (Sum of all 'general' type donations)
        const { data: generalData } = await supabase.from('donations')
            .select('amount')
            .eq('donation_type', 'general');

        const totalGeneral = generalData ? generalData.reduce((acc, curr) => acc + curr.amount, 0) : 0;
        setGeneralFund(totalGeneral);

        const { data: zakatData } = await supabase.from('donations')
            .select('amount')
            .eq('donation_type', 'zakat');

        const totalZakat = zakatData ? zakatData.reduce((acc, curr) => acc + curr.amount, 0) : 0;
        setZakatFund(totalZakat);
        setLoading(false);
    };

    const fetchActiveMissions = async () => {
        // Fetch Disasters
        const { data: disasters } = await supabase.from('disasters').select('id, title').eq('status', 'active');
        // Fetch Medical
        const { data: medical } = await supabase.from('medical_cases').select('id, title').eq('status', 'active');

        const combined = [
            ...(disasters || []).map(d => ({ ...d, type: 'disaster' })),
            ...(medical || []).map(m => ({ ...m, type: 'medical' }))
        ];
        setActiveMissions(combined);
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        const amt = parseFloat(allocationAmount);
        if (!selectedMission || !amt || amt <= 0) return alert("Invalid inputs");

        const sourceFund = mpType === 'general' ? generalFund : zakatFund;
        if (amt > sourceFund) return alert("Insufficient funds in selected pool.");

        try {
            const mission = activeMissions.find(m => m.id === selectedMission);
            const table = mission.type === 'disasters' ? 'disasters' : (mission.type === 'medical' ? 'medical_cases' : 'disasters'); // simple check, actually type was set above

            // 1. Deduct from Pool (Insert negative donation record)
            const { error: deductError } = await supabase.from('donations').insert({
                user_id: (await supabase.auth.getUser()).data.user.id, // Admin ID
                amount: -amt,
                donation_type: mpType,
                payment_method: 'bkash', // Simulated
                phone_last_4: '0000',
                transaction_id: `ALLOC_TO_${mission.id.slice(0, 8)}`,
                status: 'approved'
            });
            if (deductError) throw deductError;

            // 2. Add to Target Mission (Update collected_amount)
            // We verify table name based on type
            const tableName = mission.type === 'medical' ? 'medical_cases' : 'disasters';

            // We need to fetch current amount first or use RPC increment. 
            // Since we don't have RPC setup, we read-then-write (optimistic).
            const { data: current, error: fetchErr } = await supabase.from(tableName).select('collected_amount').eq('id', mission.id).single();
            if (fetchErr) throw fetchErr;

            const { error: updateError } = await supabase.from(tableName)
                .update({ collected_amount: (current.collected_amount || 0) + amt })
                .eq('id', mission.id);

            if (updateError) throw updateError;

            alert("Allocation Successful!");
            setAllocationAmount('');
            fetchFunds(); // Refresh balance
        } catch (error) {
            console.error(error);
            alert("Allocation Failed: " + error.message);
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Fund Allocation Center</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', border: '1px solid #6366f1', background: 'rgba(99, 102, 241, 0.1)' }}>
                    <h3 style={{ color: '#aaa', margin: 0 }}>General Fund Available</h3>
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', margin: '10px 0' }}>৳{generalFund.toLocaleString()}</p>
                    <p style={{ color: '#6366f1', fontSize: '0.9rem' }}>Unrestricted Funds</p>
                </div>
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                    <h3 style={{ color: '#aaa', margin: 0 }}>Zakat Fund Available</h3>
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', margin: '10px 0' }}>৳{zakatFund.toLocaleString()}</p>
                    <p style={{ color: '#10b981', fontSize: '0.9rem' }}>Restricted for Zakat Eligible</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', border: '1px solid #333' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white' }}>Allocate Funds to Active Missions</h3>
                <form onSubmit={handleAllocate} style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>

                    <div>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px' }}>Source Pool</label>
                        <select value={mpType} onChange={e => setMpType(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
                            <option value="general">General Fund (৳{generalFund})</option>
                            <option value="zakat">Zakat Fund (৳{zakatFund})</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px' }}>Target Mission</label>
                        <select value={selectedMission} onChange={e => setSelectedMission(e.target.value)} required
                            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
                            <option value="">Select an active mission...</option>
                            <optgroup label="Disaster Relief">
                                {activeMissions.filter(m => m.type === 'disaster').map(m => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Medical Cases">
                                {activeMissions.filter(m => m.type === 'medical').map(m => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px' }}>Amount to Transfer</label>
                        <input type="number" value={allocationAmount} onChange={e => setAllocationAmount(e.target.value)} placeholder="0.00"
                            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
                    </div>

                    <button type="submit"
                        style={{ padding: '14px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        Confirm Allocation
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
