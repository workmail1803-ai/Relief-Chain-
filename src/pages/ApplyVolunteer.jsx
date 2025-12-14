import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Heart, Truck, Stethoscope, Wrench, Shield,
    Clock, CheckCircle, ChevronRight, ChevronLeft, Star
} from 'lucide-react';

const ApplyVolunteer = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [existingApplication, setExistingApplication] = useState(null);
    const [step, setStep] = useState(1);

    // Form Data
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [motivation, setMotivation] = useState('');
    const [availability, setAvailability] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user) {
            checkExistingApplication();
        }
    }, [user, authLoading, navigate]);

    const checkExistingApplication = async () => {
        const { data } = await supabase
            .from('volunteer_applications')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) {
            setExistingApplication(data);
        }
    };

    const roles = [
        { id: 'medical', label: 'Medical Aid', icon: <Stethoscope size={24} />, color: '#10b981' },
        { id: 'rescue', label: 'Search & Rescue', icon: <Shield size={24} />, color: '#ef4444' },
        { id: 'logistics', label: 'Logistics', icon: <Truck size={24} />, color: '#f59e0b' },
        { id: 'tech', label: 'Tech Support', icon: <Wrench size={24} />, color: '#6366f1' },
        { id: 'support', label: 'Emotional Support', icon: <Heart size={24} />, color: '#ec4899' },
        { id: 'general', label: 'General Helper', icon: <User size={24} />, color: '#8b5cf6' }
    ];

    const availabilityOptions = [
        "Weekends Only", "Weekdays", "24/7 Emergency", "Remote Only"
    ];

    const toggleRole = (role) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            // 1. Ensure Profile Exists (Self-Healing for FK Constraint)
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (!profile) {
                // Profile missing, recreate it
                const { error: createProfileError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || 'Volunteer',
                        role: 'user' // Default to user, will be upgraded to volunteer if approved
                    }]);

                if (createProfileError) throw createProfileError;
            }

            // 2. Submit Application
            // Combine roles into a string for the 'skills' column
            const skillsString = selectedRoles.join(', ');

            const { error } = await supabase
                .from('volunteer_applications')
                .insert([
                    {
                        user_id: user.id,
                        skills: skillsString,
                        motivation: motivation,
                        availability: availability
                    }
                ]);

            if (error) throw error;

            alert("Application submitted successfully!");
            checkExistingApplication();
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Animation Variants
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0
        })
    };

    if (authLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', color: 'white' }}>
            <Navbar />

            <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2rem' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'inline-flex', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}
                    >
                        <Star size={40} color="#6366f1" fill="rgba(99, 102, 241, 0.2)" />
                    </motion.div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                        Join the Elite Force
                    </h1>
                    <p style={{ color: '#888', fontSize: '1.1rem' }}>Become a Core Volunteer and lead the change.</p>
                </div>

                {existingApplication ? (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-card"
                        style={{ padding: '3rem', textAlign: 'center', background: '#111', border: '1px solid #333', borderRadius: '24px' }}
                    >
                        {existingApplication.status === 'pending' && <Clock size={64} color="#f59e0b" style={{ margin: '0 auto 1.5rem' }} />}
                        {existingApplication.status === 'approved' && <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />}
                        {existingApplication.status === 'rejected' && <Shield size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />}

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
                            {existingApplication.status === 'pending' && "Application Under Review"}
                            {existingApplication.status === 'approved' && "Welcome to the Team!"}
                            {existingApplication.status === 'rejected' && "Application Status"}
                        </h2>
                        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
                            {existingApplication.status === 'pending' && "We are reviewing your profile. Hang tight!"}
                            {existingApplication.status === 'approved' && "You are now an verified volunteer. Access your hub to start."}
                            {existingApplication.status === 'rejected' && "Unfortunately, we couldn't proceed with your application at this time."}
                        </p>
                    </motion.div>
                ) : (
                    <div style={{ background: '#161616', borderRadius: '24px', border: '1px solid #333', overflow: 'hidden', padding: '2rem' }}>

                        {/* Progress Bar */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '3rem', justifyContent: 'center' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: '40px', height: '4px', borderRadius: '2px',
                                    background: step >= i ? '#6366f1' : '#333',
                                    transition: 'background 0.3s'
                                }} />
                            ))}
                        </div>

                        <AnimatePresence mode='wait' custom={step}>
                            {step === 1 && (
                                <motion.div key="step1" custom={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Choose Your Role</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                        {roles.map(role => (
                                            <div
                                                key={role.id}
                                                onClick={() => toggleRole(role.label)}
                                                style={{
                                                    background: selectedRoles.includes(role.label) ? `rgba(${role.color === '#10b981' ? '16, 185, 129' : '99, 102, 241'}, 0.2)` : '#222',
                                                    border: selectedRoles.includes(role.label) ? `2px solid ${role.color}` : '2px solid transparent',
                                                    borderRadius: '16px', padding: '1.5rem',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ color: role.color }}>{role.icon}</div>
                                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{role.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={selectedRoles.length === 0}
                                            style={{
                                                padding: '12px 24px', borderRadius: '12px', background: selectedRoles.length > 0 ? '#6366f1' : '#333',
                                                color: selectedRoles.length > 0 ? 'white' : '#666', border: 'none', cursor: selectedRoles.length > 0 ? 'pointer' : 'not-allowed',
                                                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                                            }}
                                        >
                                            Next <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" custom={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Why do you want to join?</h3>
                                    <textarea
                                        value={motivation}
                                        onChange={(e) => setMotivation(e.target.value)}
                                        placeholder="Tell us about yourself and why you want to help..."
                                        style={{
                                            width: '100%', minHeight: '200px', background: '#222', border: '1px solid #444', borderRadius: '16px',
                                            padding: '1.5rem', color: 'white', fontSize: '1rem', outline: 'none'
                                        }}
                                    ></textarea>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                                        <button onClick={() => setStep(1)} style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ChevronLeft size={18} /> Back
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            disabled={!motivation.trim()}
                                            style={{
                                                padding: '12px 24px', borderRadius: '12px', background: motivation.trim() ? '#6366f1' : '#333',
                                                color: motivation.trim() ? 'white' : '#666', border: 'none', cursor: motivation.trim() ? 'pointer' : 'not-allowed',
                                                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                                            }}
                                        >
                                            Next <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" custom={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>When are you available?</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                        {availabilityOptions.map(opt => (
                                            <div
                                                key={opt}
                                                onClick={() => setAvailability(opt)}
                                                style={{
                                                    background: availability === opt ? '#6366f1' : '#222',
                                                    color: availability === opt ? 'white' : '#aaa',
                                                    padding: '1.5rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                                    fontWeight: '600', transition: 'all 0.2s', border: '1px solid transparent',
                                                    borderColor: availability === opt ? 'transparent' : '#333'
                                                }}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                                        <button onClick={() => setStep(2)} style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ChevronLeft size={18} /> Back
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!availability || loading}
                                            style={{
                                                padding: '16px 32px', borderRadius: '12px', background: loading ? '#333' : '#10b981',
                                                color: loading ? '#666' : 'white', border: 'none', cursor: loading ? 'wait' : 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.1rem',
                                                boxShadow: loading ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.4)'
                                            }}
                                        >
                                            {loading ? 'Submitting...' : 'Submit Application'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplyVolunteer;
