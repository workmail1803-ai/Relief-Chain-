import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';

const MedicalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#1a1a1a', color: 'white' }}>
            <Navbar />
            <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <button onClick={() => navigate(-1)} style={{
                    background: 'transparent', border: 'none', color: '#888',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1rem'
                }}>
                    <ArrowLeft size={18} /> Back
                </button>

                <h1>Medical Case Details</h1>
                <p style={{ color: '#aaa' }}>Viewing details for Case ID: {id}</p>
                <div style={{ marginTop: '2rem', padding: '2rem', background: '#222', borderRadius: '12px' }}>
                    <p>Detailed view implementation under construction.</p>
                </div>
            </div>
        </div>
    );
};

export default MedicalDetail;
