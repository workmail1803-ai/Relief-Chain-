/**
 * InfoCards Component (MVC Pattern)
 * View Layer - Dashboard statistics cards
 */
import { useState } from 'react';
import { DollarSign, Users, Flame, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InfoCards = ({ stats }) => {
    const [showBreakdown, setShowBreakdown] = useState(false);

    const formatCurrency = (amount) => {
        if (!amount) return '৳0';
        if (amount >= 1000000) return `৳${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `৳${(amount / 1000).toFixed(1)}K`;
        return `৳${amount}`;
    };

    const cardData = [
        {
            title: 'Total Collected',
            value: stats ? formatCurrency(stats.totalCollected) : '৳0',
            icon: <DollarSign color="#10b981" />,
            color: 'rgba(16, 185, 129, 0.1)',
            isInteractive: true
        },
        {
            title: 'Volunteers',
            value: stats ? stats.volunteers.toLocaleString() : '0',
            icon: <Users color="#6366f1" />,
            color: 'rgba(99, 102, 241, 0.1)'
        },
        {
            title: 'Active Disasters',
            value: stats ? stats.activeDisasters : '0',
            icon: <Flame color="#f59e0b" />,
            color: 'rgba(245, 158, 11, 0.1)'
        },
        {
            title: 'Active Medical Cases',
            value: stats ? stats.medicalCasesCount : '0', // Shows 0 if 0
            icon: <Activity color="#ef4444" />,
            color: 'rgba(239, 68, 68, 0.1)'
        }
    ];

    return (
        <div className="info-cards-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {cardData.map((stat, index) => (
                <div
                    key={index}
                    className="glass-card"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative',
                        cursor: stat.isInteractive ? 'pointer' : 'default'
                    }}
                    onClick={() => stat.isInteractive && setShowBreakdown(!showBreakdown)}
                >
                    <div style={{ padding: '12px', borderRadius: '12px', background: stat.color, display: 'flex' }}>
                        {stat.icon}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: '#888' }}>{stat.title}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</div>
                    </div>

                    {/* Cloud Popup for Total Collected */}
                    {stat.isInteractive && (
                        <AnimatePresence>
                            {showBreakdown && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: -10 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    style={{
                                        position: 'absolute',
                                        top: '-120px', // Position above
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'white',
                                        color: 'black',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        width: '220px',
                                        zIndex: 10,
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                        textAlign: 'left'
                                    }}
                                >
                                    {/* Triangle Pointer */}
                                    <div style={{
                                        position: 'absolute', bottom: '-8px', left: '50%', marginLeft: '-8px',
                                        width: 0, height: 0,
                                        borderLeft: '8px solid transparent',
                                        borderRight: '8px solid transparent',
                                        borderTop: '8px solid white'
                                    }}></div>

                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#333' }}>Fund Breakdown</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                                        <span style={{ color: '#666' }}>General Fund:</span>
                                        <span style={{ fontWeight: 'bold' }}>{stats ? formatCurrency(stats.generalFund) : '৳0'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                        <span style={{ color: '#666' }}>Direct Cause:</span>
                                        <span style={{ fontWeight: 'bold' }}>{stats ? formatCurrency(stats.totalCollected - stats.generalFund) : '৳0'}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            ))}
        </div>
    );
};

export default InfoCards;
