import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
// Navbar import removed
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Upload, Save } from 'lucide-react';

const CreateMission = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        severity: 'medium',
        target_amount: '',
        volunteers_needed: '',
        description: '',
        is_urgent: false,
        image_url: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            // Simple compression/resize could go here, but uploading direct for now
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('disasters')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('disasters').getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
            alert("Image uploaded successfully!");
        } catch (error) {
            console.error(error);
            alert("Error uploading image: " + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('disasters')
                .insert([
                    {
                        ...formData,
                        target_amount: parseFloat(formData.target_amount) || 0,
                        volunteers_needed: parseInt(formData.volunteers_needed) || 0,
                        status: 'pending' // Force pending
                    }
                ]);

            if (error) throw error;

            alert("Mission Submitted! It will be reviewed by an admin shortly.");
            navigate('/disasters');
        } catch (error) {
            console.error(error);
            alert("Error creating mission: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#121212', fontFamily: 'Inter, sans-serif' }}>


            <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '2rem' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <AlertTriangle color="#ef4444" size={32} /> Launch Relief Mission
                    </h1>
                    <p style={{ color: '#aaa' }}>As a Core Team member, you can mobilize help instantly.</p>
                </div>

                <div className="glass-card" style={{ padding: '2rem', background: '#1e1e1e', borderRadius: '16px', border: '1px solid #333' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>Mission Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                    style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                    style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: 'white' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>Severity</label>
                                <select name="severity" value={formData.severity} onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: 'white' }}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>Target Fund ($)</label>
                                <input type="number" name="target_amount" value={formData.target_amount} onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>Volunteers Needed</label>
                                <input type="number" name="volunteers_needed" value={formData.volunteers_needed} onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: 'white' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleChange} id="urgency"
                                style={{ width: '20px', height: '20px' }} />
                            <label htmlFor="urgency" style={{ color: '#ef4444', fontWeight: 'bold' }}>Mark as URGENT Emergency</label>
                        </div>

                        <div>
                            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>Cover Image</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="file" accept="image/*" onChange={handleImageUpload}
                                    style={{ flex: 1, padding: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: 'white' }} />
                                {formData.image_url && (
                                    <img src={formData.image_url} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                )}
                            </div>
                        </div>

                        <div>
                            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="5"
                                style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: 'white' }}></textarea>
                        </div>

                        <button type="submit" disabled={loading}
                            style={{
                                width: '100%', padding: '16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px',
                                fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}>
                            {loading ? 'Submitting...' : <><Save size={20} /> Submit for Review</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateMission;
