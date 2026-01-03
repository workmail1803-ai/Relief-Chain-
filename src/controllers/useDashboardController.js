/**
 * useDashboard Controller - Custom hook for dashboard data logic
 */

import { useState, useEffect, useCallback } from 'react';
import * as disasterModel from '../models/disasterModel';
import * as medicalModel from '../models/medicalModel';
import * as volunteerModel from '../models/volunteerModel';
import * as donationModel from '../models/donationModel';
import * as authModel from '../models/authModel';

export const useDashboardController = (userId) => {
    const [profile, setProfile] = useState(null);
    const [disasters, setDisasters] = useState([]);
    const [medicalCases, setMedicalCases] = useState([]);
    const [stats, setStats] = useState({
        totalCollected: 0,
        generalFund: 0,
        volunteers: 0,
        activeDisasters: 0,
        medicalCasesCount: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        try {
            // Fetch Profile
            const { data: profileData } = await authModel.getUserProfile(userId);
            setProfile(profileData);

            // Fetch Stats
            const { count: volCount } = await volunteerModel.getVolunteersCount();
            const { count: disCount } = await disasterModel.getActiveDisastersCount();
            const { count: medCount } = await medicalModel.getActiveMedicalCasesCount();

            const { data: disasterFunds } = await disasterModel.getTotalDisasterFunds();
            const { data: medicalFunds } = await medicalModel.getTotalMedicalFunds();
            const { data: generalFunds } = await donationModel.getGeneralFundTotal();

            const totalDisaster = disasterFunds?.reduce((sum, item) => sum + (item.collected_amount || 0), 0) || 0;
            const totalMedical = medicalFunds?.reduce((sum, item) => sum + (item.collected_amount || 0), 0) || 0;
            const totalGeneral = generalFunds?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

            setStats({
                totalCollected: totalDisaster + totalMedical + totalGeneral,
                generalFund: totalGeneral,
                volunteers: volCount || 0,
                activeDisasters: disCount || 0,
                medicalCasesCount: medCount || 0
            });

            // Fetch Urgent Disasters
            const { data: disasterData } = await disasterModel.fetchUrgentDisasters(3);
            if (disasterData) {
                const formattedDisasters = disasterData.map(d => ({
                    id: d.id,
                    title: d.title,
                    volunteers: `${d.assigned_volunteers_count || 0}/${d.volunteers_needed || 0}`,
                    funds: `৳${d.collected_amount || 0} / ৳${d.target_amount}`,
                    image: d.image_url || 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80',
                    is_urgent: d.is_urgent
                }));
                setDisasters(formattedDisasters);
            }

            // Fetch Medical Cases
            const { data: medicalData } = await medicalModel.fetchRecentMedicalCases(3);
            if (medicalData) {
                const formattedMedical = medicalData.map(m => ({
                    id: m.id,
                    title: m.patient_name,
                    condition: m.condition,
                    amount: `৳${m.target_amount}`,
                    image: m.image_url || 'https://images.unsplash.com/photo-1516574187841-693083f6e163?auto=format&fit=crop&q=80'
                }));
                setMedicalCases(formattedMedical);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        profile,
        disasters,
        medicalCases,
        stats,
        loading,
        refetch: fetchDashboardData
    };
};

export default useDashboardController;
