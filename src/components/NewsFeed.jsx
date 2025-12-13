import { Share2, MessageCircle, Heart } from 'lucide-react';

const NewsFeed = () => {
    const news = [
        {
            id: 1,
            author: 'Relief HQ',
            time: '2 hours ago',
            content: 'Our team has successfully reached the flood-affected areas in Sylhet. Distribution of food and dry clothes has started.',
            image: null,
            likes: 124,
            comments: 45
        },
        {
            id: 2,
            author: 'Medical Wing',
            time: '5 hours ago',
            content: 'Urgent call for O+ blood donors at City Hospital. A critical surgery is scheduled for tomorrow morning.',
            image: null,
            likes: 89,
            comments: 12
        },
        {
            id: 3,
            author: 'Volunteer Group A',
            time: '1 day ago',
            content: 'Mission Complete! Build 50 temporary shelters in the cyclone-hit zone. Thank you to all donors!',
            image: null,
            likes: 456,
            comments: 88
        }
    ];

    return (
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s', height: 'fit-content' }}>
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Latest Updates</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {news.map(item => (
                    <div key={item.id} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>{item.author}</span>
                            <span style={{ color: '#666', fontSize: '0.85rem' }}>{item.time}</span>
                        </div>
                        <p style={{ margin: '0 0 1rem 0', color: '#ddd' }}>{item.content}</p>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <button style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', gap: '6px', cursor: 'pointer', alignItems: 'center' }}>
                                <Heart size={18} /> {item.likes}
                            </button>
                            <button style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', gap: '6px', cursor: 'pointer', alignItems: 'center' }}>
                                <MessageCircle size={18} /> {item.comments}
                            </button>
                            <button style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', gap: '6px', cursor: 'pointer', alignItems: 'center' }}>
                                <Share2 size={18} /> Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsFeed;
