import { DollarSign, Users, Flame, Activity } from 'lucide-react';

const InfoCards = () => {
    const stats = [
        { title: 'Total Collected', value: '$1.2M', icon: <DollarSign color="#10b981" />, color: 'rgba(16, 185, 129, 0.1)' },
        { title: 'Volunteers', value: '3,450', icon: <Users color="#6366f1" />, color: 'rgba(99, 102, 241, 0.1)' },
        { title: 'Active Disasters', value: '12', icon: <Flame color="#f59e0b" />, color: 'rgba(245, 158, 11, 0.1)' },
        { title: 'Medical Cases', value: '856', icon: <Activity color="#ef4444" />, color: 'rgba(239, 68, 68, 0.1)' }
    ];

    return (
        <div className="info-cards-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {stats.map((stat, index) => (
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
