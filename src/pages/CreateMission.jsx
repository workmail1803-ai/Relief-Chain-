/**
 * CreateMission View Component (MVC Pattern)
 * View Layer - Handles mission creation UI
 */
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Upload, Save, MapPin, DollarSign, Users, FileText, Activity, ShieldAlert, Radio, Stethoscope, Hospital, User } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateMission = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    // Mission Type: 'disaster' or 'medical'
    const [missionType, setMissionType] = useState('disaster');

    const [formData, setFormData] = useState({
        // Common
        title: '',
        severity: 'medium',
        target_amount: '',
        volunteers_needed: '',
        description: '',
        is_urgent: false,
        image_url: '',

        // Disaster Specific
        location: '',

        // Medical Specific
        patient_name: '',
        hospital_name: '',
        condition: '', // e.g. "Heart Surgery", "Kidney Transplant"
        documents_url: '', // Link to drive or file
        bkash_number: ''
    });

    useEffect(() => {
        if (location.state?.type) {
            setMissionType(location.state.type);
        }
    }, [location]);

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
            const bucket = missionType === 'medical' ? 'medical' : 'disasters';
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

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
            const commonData = {
                title: formData.title,
                severity: formData.severity,
                target_amount: parseFloat(formData.target_amount) || 0,
                volunteers_needed: parseInt(formData.volunteers_needed) || 0,
                description: formData.description,
                is_urgent: formData.is_urgent,
                image_url: formData.image_url,
                status: 'pending',
                created_by: user.id
            };

            let table = '';
            let payload = {};

            if (missionType === 'disaster') {
                table = 'disasters';
                payload = {
                    ...commonData,
                    location: formData.location
                };
            } else {
                table = 'medical_cases';
                payload = {
                    ...commonData,
                    patient_name: formData.patient_name,
                    hospital_name: formData.hospital_name,
                    condition: formData.condition,
                    bkash_number: formData.bkash_number,
                    documents_url: formData.documents_url
                };
            }

            const { error } = await supabase
                .from(table)
                .insert([payload]);

            if (error) throw error;

            alert("Mission Submitted! It will be reviewed by an admin shortly.");
            navigate(missionType === 'medical' ? '/medical' : '/disasters');
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
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                        <div style={{ width: '8px', height: '8px', background: missionType === 'medical' ? '#6366f1' : '#ef4444', borderRadius: '50%', boxShadow: `0 0 10px ${missionType === 'medical' ? '#6366f1' : '#ef4444'}` }}></div>
                        <span style={{ fontSize: '0.9rem', color: '#aaa', letterSpacing: '1px', fontWeight: '600' }}>MISSION CONTROL</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 10px 0', background: 'linear-gradient(to bottom, #fff, #888)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                        Launch {missionType === 'medical' ? 'Medical Appeal' : 'Relief Operation'}
                    </h1>
                    <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        {missionType === 'medical' ? 'Connect patients with life-saving support.' : 'Mobilize the network. Every second counts.'}
                    </p>
                </motion.div>

                {/* Type Selection */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                    <div style={{ background: '#111', padding: '6px', borderRadius: '16px', border: '1px solid #333', display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setMissionType('disaster')}
                            style={{
                                padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                background: missionType === 'disaster' ? '#ef4444' : 'transparent',
                                color: missionType === 'disaster' ? 'white' : '#888',
                                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s'
                            }}>
                            <AlertTriangle size={18} /> Disaster Relief
                        </button>
                        <button
                            onClick={() => setMissionType('medical')}
                            style={{
                                padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                background: missionType === 'medical' ? '#6366f1' : 'transparent',
                                color: missionType === 'medical' ? 'white' : '#888',
                                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s'
                            }}>
                            <Stethoscope size={18} /> Medical Case
                        </button>
                    </div>
                </div>

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
                            <Activity color={missionType === 'medical' ? '#6366f1' : '#ef4444'} size={20} /> Case Information
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>TITLE / HEADLINE</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder={missionType === 'medical' ? "e.g. Urgent Heart Surgery Support for Ayesha" : "e.g. Operation Flood Relief 2024"}
                                        style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1.1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                        onFocus={(e) => e.target.style.borderColor = missionType === 'medical' ? '#6366f1' : '#ef4444'}
                                        onBlur={(e) => e.target.style.borderColor = '#333'}
                                    />
                                    <FileText size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>

                                {missionType === 'disaster' ? (
                                    <div style={{ flex: '1 1 300px' }}>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>TARGET LOCATION</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                required={missionType === 'disaster'}
                                                placeholder="City, Region, or Coordinates"
                                                style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                            />
                                            <MapPin size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ flex: '1 1 300px' }}>
                                            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>PATIENT NAME</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    name="patient_name"
                                                    value={formData.patient_name}
                                                    onChange={handleChange}
                                                    required={missionType === 'medical'}
                                                    placeholder="Full Name"
                                                    style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                                />
                                                <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                            </div>
                                        </div>
                                        <div style={{ flex: '1 1 300px' }}>
                                            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>HOSPITAL / CLINIC</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    name="hospital_name"
                                                    value={formData.hospital_name}
                                                    onChange={handleChange}
                                                    required={missionType === 'medical'}
                                                    placeholder="Name of Medical Facility"
                                                    style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                                />
                                                <Hospital size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div style={{ flex: '1 1 300px' }}>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>SEVERITY LEVEL</label>
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
                                                    background: formData.severity === level ? (level === 'critical' ? '#ef4444' : (missionType === 'medical' ? '#6366f1' : '#f59e0b')) : 'transparent',
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

                            {missionType === 'medical' && (
                                <div style={{ width: '100%' }}>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>MEDICAL CONDITION</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            name="condition"
                                            value={formData.condition}
                                            onChange={handleChange}
                                            required={missionType === 'medical'}
                                            placeholder="e.g. Acute Leukemia, Kidney Failure"
                                            style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                        />
                                        <Activity size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Logistics & Media */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                        <motion.div variants={itemVariants} className="glass-card" style={{ flex: '1 1 300px', padding: '2.5rem', background: '#111', borderRadius: '24px', border: '1px solid #222' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                                <Users color="#10b981" size={20} /> Requirements
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>FINANCIAL NEEDS</label>
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
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>{missionType === 'medical' ? 'SUPPORT STAFF / BLOOD DONORS' : 'MANPOWER NEEDED'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            name="volunteers_needed"
                                            value={formData.volunteers_needed}
                                            onChange={handleChange}
                                            placeholder="Total count"
                                            style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                        <Users size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                    </div>
                                </div>
                                {missionType === 'medical' && (
                                    <div>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>BKASH NUMBER (Personal/Agent)</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                name="bkash_number"
                                                value={formData.bkash_number}
                                                onChange={handleChange}
                                                placeholder="017xxxxxxxx"
                                                style={{ width: '100%', padding: '16px 16px 16px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-card" style={{ flex: '1 1 300px', padding: '2.5rem', background: '#111', borderRadius: '24px', border: '1px solid #222' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                                <Upload color="#f59e0b" size={20} /> Attachments
                            </h3>
                            <div style={{ height: '240px', border: '2px dashed #333', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#1a1a1a' }}>
                                {formData.image_url ? (
                                    <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <Upload size={32} color="#444" style={{ marginBottom: '1rem' }} />
                                        <span style={{ color: '#666', fontSize: '0.9rem' }}>{missionType === 'medical' ? 'Upload patient/report photo' : 'Click to upload mission cover'}</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Description & Action */}
                    <motion.div variants={itemVariants} className="glass-card" style={{ padding: '2.5rem', background: '#111', borderRadius: '24px', border: '1px solid #222' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                            <FileText color="#888" size={20} /> {missionType === 'medical' ? 'Case Details' : 'Mission Briefing'}
                        </h3>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            placeholder={missionType === 'medical' ? "Describe the condition, history, and why help is needed..." : "Detailed operational directives..."}
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
                                    background: missionType === 'medical' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                                    transition: 'transform 0.2s',
                                    opacity: loading ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                {loading ? 'Processing...' : <>SUBMIT APPEAL <Save size={20} /></>}
                            </button>
                        </div>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
};

export default CreateMission;
