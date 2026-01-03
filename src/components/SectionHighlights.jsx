/**
 * SectionHighlights Component (MVC Pattern)
 * View Layer - Highlighted sections for disasters/medical cases
 */
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SectionHighlights = ({ title, items, type = 'disaster' }) => {
    return (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem', animationDelay: '0.3s' }}>
            <div className="section-header">
                <span className="section-title">{title}</span>
                <Link to={type === 'disaster' ? '/disasters' : '/medical'} style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none'
                }}>
                    View All <ArrowRight size={16} />
                </Link>
            </div>

            <div className="highlights-container">
                {items.map((item, index) => (
                    <div key={index} className="highlight-card glass-card" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            height: '140px',
                            background: '#333',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            backgroundImage: `url(${item.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative'
                        }}>
                            {type === 'disaster' && item.is_urgent && (
                                <span style={{
                                    position: 'absolute', top: 8, right: 8,
                                    background: '#ef4444', color: 'white',
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>
                                    URGENT
                                </span>
                            )}
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{item.title}</h3>

                        {type === 'disaster' ? (
                            <div style={{ fontSize: '0.9rem', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                <span>Volunteers: <span style={{ color: 'white' }}>{item.volunteers}</span></span>
                                <span>Funds Needed: <span style={{ color: '#10b981' }}>{item.funds}</span></span>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.9rem', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                <span>Condition: <span style={{ color: 'white' }}>{item.condition}</span></span>
                                <span>Urgent Help: <span style={{ color: '#10b981' }}>{item.amount}</span></span>
                            </div>
                        )}

                        <Link to={type === 'disaster' ? `/disasters/${item.id}` : `/medical/${item.id}`} style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '0.5rem',
                            background: 'var(--primary)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'block',
                            textAlign: 'center',
                            textDecoration: 'none'
                        }}>
                            View Details
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SectionHighlights;
