import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
// Navbar import removed
import InfoCards from '../components/InfoCards';
import NewsFeed from '../components/NewsFeed';
import SectionHighlights from '../components/SectionHighlights';

const Dashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);

    const [disasters, setDisasters] = useState([]);
    const [medicalCases, setMedicalCases] = useState([]);

    const [stats, setStats] = useState({
        totalCollected: 0,
        volunteers: 0,
        activeDisasters: 0,
        medicalCasesCount: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                // Fetch Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profileData);

                // Fetch Stats
                const fetchStats = async () => {
                    // 1. Volunteers Count
                    const { count: volCount } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('role', 'volunteer');

                    // 2. Active Disasters Count
                    const { count: disCount } = await supabase
                        .from('disasters')
                        .select('*', { count: 'exact', head: true })
                        .eq('status', 'active');

                    // 3. Medical Cases Count
                    const { count: medCount } = await supabase
                        .from('medical_cases')
                        .select('*', { count: 'exact', head: true });

                    // 4. Total Funds (Fetching amounts to sum client-side for now - optimizing requires RPC)
                    const { data: disasterFunds } = await supabase.from('disasters').select('collected_amount');
                    const { data: medicalFunds } = await supabase.from('medical_cases').select('collected_amount');

                    const totalDisaster = disasterFunds?.reduce((sum, item) => sum + (item.collected_amount || 0), 0) || 0;
                    const totalMedical = medicalFunds?.reduce((sum, item) => sum + (item.collected_amount || 0), 0) || 0;

                    setStats({
                        totalCollected: totalDisaster + totalMedical,
                        volunteers: volCount || 0,
                        activeDisasters: disCount || 0,
                        medicalCasesCount: medCount || 0
                    });
                };
                fetchStats();

                // Fetch Urgent Disasters (Sorted by created_at DESC as requested)
                const { data: disasterData } = await supabase
                    .from('disasters')
                    .select('*')
                    .eq('is_urgent', true)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (disasterData) {
                    const formattedDisasters = disasterData.map(d => ({
                        id: d.id,
                        title: d.title,
                        volunteers: `${d.assigned_volunteers_count || 0}/${d.volunteers_needed || 0}`,
                        funds: `$${d.collected_amount || 0} / $${d.target_amount}`,
                        image: d.image_url || 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80',
                        is_urgent: d.is_urgent
                    }));
                    setDisasters(formattedDisasters);
                }

                // Fetch Medical Cases
                const { data: medicalData } = await supabase
                    .from('medical_cases')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (medicalData) {
                    const formattedMedical = medicalData.map(m => ({
                        id: m.id,
                        title: m.patient_name,
                        condition: m.condition,
                        amount: `$${m.target_amount}`,
                        image: m.image_url || 'https://images.unsplash.com/photo-1516574187841-693083f6e163?auto=format&fit=crop&q=80'
                    }));
                    setMedicalCases(formattedMedical);
                }
            }
        };
        fetchData();
    }, [user]);

    return (
        <div style={{ minHeight: '100vh', padding: '1rem' }}>


            <style>
                {`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .dashboard-fade-in {
                        animation: fadeInUp 0.6s ease-out forwards;
                        opacity: 0; /* Start hidden */
                    }
                `}
            </style>

            <div className="dashboard-layout">
                {/* Main Content Area */}
                <div>
                    <div className="dashboard-fade-in" style={{ marginBottom: '2rem', textAlign: 'left', animationDelay: '0.1s' }}>
                        <h1 className="welcome-text" style={{ margin: 0 }}>
                            Welcome back, <span style={{ color: '#646cff' }}>{profile?.full_name || 'Volunteer'}</span>
                        </h1>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>Here's what's happening in your relief network today.</p>
                    </div>

                    <div className="dashboard-fade-in" style={{ animationDelay: '0.2s' }}>
                        <InfoCards stats={stats} />
                    </div>

                    <div className="dashboard-fade-in" style={{ animationDelay: '0.3s' }}>
                        <SectionHighlights title="Urgent Disaster Response" items={disasters} type="disaster" />
                    </div>

                    <div className="dashboard-fade-in" style={{ animationDelay: '0.4s' }}>
                        <SectionHighlights title="Medical Aid Needed" items={medicalCases} type="medical" />
                    </div>
                </div>

                {/* Sidebar / News Feed */}
                <div className="dashboard-fade-in" style={{ animationDelay: '0.5s' }}>
                    <NewsFeed />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
