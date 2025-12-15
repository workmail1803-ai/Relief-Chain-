import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Upload, Save, MapPin, DollarSign, Users, FileText, Activity, ShieldAlert, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

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
                        status: 'pending'
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            {/* Background handled by Layout for consistency */}

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                        <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></div>
                        <span style={{ fontSize: '0.9rem', color: '#aaa', letterSpacing: '1px', fontWeight: '600' }}>MISSION CONTROL</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 10px 0', background: 'linear-gradient(to bottom, #fff, #888)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                        Launch Relief Operation
                    </h1>
                    <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Mobilize the network. Every second counts.
                    </p>
                </motion.div>

                <motion.form
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                >
                    {/* Main Intel Card */}
                    <motion.div variants={itemVariants} className="glass-card" style={{ padding: '2.5rem', background: '#111', borderRadius: '24px', border: '1px solid #222', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                            <Activity color="#6366f1" size={20} /> Mission Intelligence
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>OPERATION NAME</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Operation Flood Relief 2024"
                                        style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1.1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                        onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                        onBlur={(e) => e.target.style.borderColor = '#333'}
                                    />
                                    <FileText size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                                <div style={{ flex: '1 1 300px' }}>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>TARGET LOCATION</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            required
                                            placeholder="City, Region, or Coordinates"
                                            style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                            onBlur={(e) => e.target.style.borderColor = '#333'}
                                        />
                                        <MapPin size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                    </div>
                                </div>

                                <div style={{ flex: '1 1 300px' }}>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>THREAT LEVEL</label>
                                    <div style={{ display: 'flex', background: '#1a1a1a', padding: '4px', borderRadius: '12px', border: '1px solid #333' }}>
                                        {['low', 'medium', 'high', 'critical'].map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, severity: level }))}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    background: formData.severity === level ? (level === 'critical' ? '#ef4444' : '#6366f1') : 'transparent',
                                                    color: formData.severity === level ? 'white' : '#666',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    textTransform: 'capitalize',
                                                    transition: 'all 0.2s',
                                                    boxShadow: formData.severity === level ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                                                }}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Logistics & Media Grid - using Flex wrap to avoid grid overlap issues */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                        {/* Logistics */}
                        <motion.div variants={itemVariants} className="glass-card" style={{ flex: '1 1 300px', padding: '2.5rem', background: '#111', borderRadius: '24px', border: '1px solid #222' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                                <Users color="#10b981" size={20} /> Logistics
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>FINANCIAL TARGET</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            name="target_amount"
                                            value={formData.target_amount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                        <DollarSign size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>MANPOWER NEEDED</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            name="volunteers_needed"
                                            value={formData.volunteers_needed}
                                            onChange={handleChange}
                                            placeholder="Number of personnel"
                                            style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                        <Users size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Media */}
                        <motion.div variants={itemVariants} className="glass-card" style={{ flex: '1 1 300px', padding: '2.5rem', background: '#111', borderRadius: '24px', border: '1px solid #222' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                                <Upload color="#f59e0b" size={20} /> Visual Intel
                            </h3>
                            <div style={{ height: '240px', border: '2px dashed #333', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#1a1a1a' }}>
                                {formData.image_url ? (
                                    <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <Upload size={32} color="#444" style={{ marginBottom: '1rem' }} />
                                        <span style={{ color: '#666', fontSize: '0.9rem' }}>Click to upload mission cover</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Description & Action */}
                    <motion.div variants={itemVariants} className="glass-card" style={{ padding: '2.5rem', background: '#111', borderRadius: '24px', border: '1px solid #222' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                            <FileText color="#888" size={20} /> Mission Briefing
                        </h3>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Detailed operational directives..."
                            style={{ width: '100%', padding: '16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box' }}
                        ></textarea>

                        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #222', paddingTop: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                                    <input
                                        type="checkbox"
                                        name="is_urgent"
                                        checked={formData.is_urgent}
                                        onChange={handleChange}
                                        style={{ width: '24px', height: '24px', opacity: 0, cursor: 'pointer', zIndex: 1, position: 'absolute' }}
                                    />
                                    <div style={{ width: '24px', height: '24px', border: '2px solid #ef4444', borderRadius: '6px', background: formData.is_urgent ? '#ef4444' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {formData.is_urgent && <ShieldAlert size={16} color="white" />}
                                    </div>
                                </div>
                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>MARK AS URGENT PRIORITY</span>
                            </label>

                            <button type="submit" disabled={loading}
                                style={{
                                    padding: '16px 48px',
                                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
                                    transition: 'transform 0.2s',
                                    opacity: loading ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                {loading ? 'Commencing...' : <>INITIATE MISSION <Save size={20} /></>}
                            </button>
                        </div>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
};

export default CreateMission;
