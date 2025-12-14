import { DollarSign, Users, Flame, Activity } from 'lucide-react';

const InfoCards = ({ stats }) => {
    const formatCurrency = (amount) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`; // Changed to decimal for accuracy
        return `$${amount}`;
    };

    const cardData = [
        {
            title: 'Total Collected',
            value: stats ? formatCurrency(stats.totalCollected) : '$0',
            icon: <DollarSign color="#10b981" />,
            color: 'rgba(16, 185, 129, 0.1)'
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
            title: 'Medical Cases',
            value: stats ? stats.medicalCasesCount : '0',
            icon: <Activity color="#ef4444" />,
            color: 'rgba(239, 68, 68, 0.1)'
        }
    ];

    return (
        <div className="info-cards-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {cardData.map((stat, index) => (
                <div key={index} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: stat.color,
                        display: 'flex'
                    }}>
                        {stat.icon}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: '#888' }}>{stat.title}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InfoCards;
