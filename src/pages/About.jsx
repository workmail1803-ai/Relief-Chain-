import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Shield, Globe } from 'lucide-react';

const About = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#e0e0e0' }}>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                    padding: '3rem',
                    textAlign: 'center',
                    marginBottom: '3rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    About Relief Chain
                </h1>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#bbb', maxWidth: '800px', margin: '0 auto' }}>
                    Relief Chain is a humanitarian initiative built to bring transparency, speed, and trust to emergency relief and social aid.
                    The project was created to ensure that donations—no matter how small—reach the right people at the right time, with full accountability.
                </p>
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}><Shield size={20} /> Transparency</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b' }}><Users size={20} /> Community</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}><Heart size={20} /> Compassion</div>
                </div>
            </motion.div>

            {/* Vision & Mission */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card"
                    style={{ padding: '2.5rem', borderRadius: '24px', background: '#111', border: '1px solid #333' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: '#6366f1' }}><Globe size={24} /></div>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Our Vision</h2>
                    </div>
                    <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        To build a transparent and people-driven relief system where trust is earned through openness and action.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card"
                    style={{ padding: '2.5rem', borderRadius: '24px', background: '#111', border: '1px solid #333' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444' }}><Target size={24} /></div>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Our Mission</h2>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#aaa', fontSize: '1.05rem', lineHeight: '1.8' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}><div style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }} /> Enable donations starting from small amounts so everyone can help</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}><div style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }} /> Maintain clear records of funds collected and distributed</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}><div style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }} /> Support disaster-affected communities quickly and responsibly</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}><div style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }} /> Empower volunteers with proper tools and accountability</li>
                    </ul>
                </motion.div>
            </div>

            {/* Founders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginBottom: '4rem' }}
            >
                <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '3rem' }}>Founders & Contributors</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    {/* Orko */}
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: '#111', borderRadius: '24px', border: '1px solid #333' }}>
                        <div style={{ width: '150px', height: '150px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden', border: '4px solid #6366f1' }}>
                            <img src="/team/founder_orko.jpg" alt="Orko Safin Ahmed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Orko Safin Ahmed</h3>
                        <span style={{ display: 'block', color: '#6366f1', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Founder & Project Lead</span>
                        <p style={{ color: '#888', lineHeight: '1.6' }}>
                            Relief Chain originated from Orko Safin’s idea and vision to create a transparent, corruption-resistant relief platform. He led the planning, concept design, and overall direction of the project.
                        </p>
                    </div>

                    {/* Nafis */}
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: '#111', borderRadius: '24px', border: '1px solid #333' }}>
                        <div style={{ width: '150px', height: '150px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden', border: '4px solid #10b981' }}>
                            <img src="/team/founder_nafis.png" alt="Nafis Hossain" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Nafis Hossain</h3>
                        <span style={{ display: 'block', color: '#10b981', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Lead Developer & Database Architect</span>
                        <p style={{ color: '#888', lineHeight: '1.6' }}>
                            Nafis was responsible for the core development of the platform, including backend logic, database design, and system implementation. His technical expertise turned the concept into a working system.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Why Matters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card"
                style={{
                    padding: '3rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
            >
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Why Relief Chain Matters</h2>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#ccc', maxWidth: '800px', margin: '0 auto' }}>
                    In many crisis situations, lack of transparency weakens trust. Relief Chain exists to change that—by making every step visible, every role accountable, and every contribution meaningful.
                </p>
            </motion.div>
        </div>
    );
};

export default About;
