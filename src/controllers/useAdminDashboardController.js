/**
 * useAdminDashboard Controller - Custom hook for admin dashboard data logic
 * Follows MVC architecture pattern
 */

import { useState, useEffect, useCallback } from 'react';
import * as disasterModel from '../models/disasterModel';
import * as medicalModel from '../models/medicalModel';
import * as volunteerModel from '../models/volunteerModel';
import * as donationModel from '../models/donationModel';
import { supabase } from '../supabaseClient';

/**
 * Controller for Admin Dashboard Overview Statistics
 */
export const useAdminOverviewController = () => {
    const [stats, setStats] = useState({
        totalDonations: 0,
        activeVolunteers: 0,
        activeDisasters: 0,
        activeMedicalCases: 0,
        pendingDonations: 0,
        pendingApplications: 0,
        pendingDisasters: 0,
        pendingMedicalCases: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Active Volunteers Count
            const { count: volunteersCount } = await volunteerModel.getVolunteersCount();

            // Fetch Active Disasters Count
            const { count: disastersCount } = await disasterModel.getActiveDisastersCount();

            // Fetch Active Medical Cases Count
            const { count: medicalCount } = await medicalModel.getActiveMedicalCasesCount();

            // Fetch Total Donations (approved only)
            const { data: donationsData } = await supabase
                .from('donations')
                .select('amount')
                .eq('status', 'approved');
            
            const totalDonations = donationsData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

            // Fetch Pending Donations Count
            const { count: pendingDonationsCount } = await supabase
                .from('donations')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Fetch Pending Volunteer Applications Count
            const { count: pendingAppsCount } = await supabase
                .from('volunteer_applications')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Fetch Pending Disasters Count
            const { count: pendingDisastersCount } = await supabase
                .from('disasters')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Fetch Pending Medical Cases Count
            const { count: pendingMedicalCount } = await supabase
                .from('medical_cases')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Fetch Recent Activity (last 5 donations)
            const { data: recentDonations } = await supabase
                .from('donations')
                .select('id, amount, created_at, status, disasters(title)')
                .order('created_at', { ascending: false })
                .limit(5);

            setStats({
                totalDonations: totalDonations,
                activeVolunteers: volunteersCount || 0,
                activeDisasters: disastersCount || 0,
                activeMedicalCases: medicalCount || 0,
                pendingDonations: pendingDonationsCount || 0,
                pendingApplications: pendingAppsCount || 0,
                pendingDisasters: pendingDisastersCount || 0,
                pendingMedicalCases: pendingMedicalCount || 0
            });

            setRecentActivity(recentDonations || []);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();

        // Subscribe to real-time updates
        const donationsChannel = supabase
            .channel('admin-donations-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, fetchStats)
            .subscribe();

        const disastersChannel = supabase
            .channel('admin-disasters-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'disasters' }, fetchStats)
            .subscribe();

        const medicalChannel = supabase
            .channel('admin-medical-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_cases' }, fetchStats)
            .subscribe();

        const applicationsChannel = supabase
            .channel('admin-applications-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteer_applications' }, fetchStats)
            .subscribe();

        return () => {
            supabase.removeChannel(donationsChannel);
            supabase.removeChannel(disastersChannel);
            supabase.removeChannel(medicalChannel);
            supabase.removeChannel(applicationsChannel);
        };
    }, [fetchStats]);

    return {
        stats,
        recentActivity,
        loading,
        refetch: fetchStats
    };
};

/**
 * Controller for Admin Disasters Management
 */
export const useAdminDisastersController = () => {
    const [disasters, setDisasters] = useState([]);
    const [pendingDisasters, setPendingDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PER_PAGE = 10;

    const fetchDisasters = useCallback(async (pageNumber = 0) => {
        setLoading(true);
        try {
            // Fetch Pending
            const { data: pendingData } = await disasterModel.fetchPendingDisasters();
            setPendingDisasters(pendingData || []);

            // Fetch Active/Completed
            const { data, error } = await disasterModel.fetchAllDisastersAdmin(pageNumber, PER_PAGE);

            if (error) {
                console.error('Error fetching disasters:', error);
            } else {
                if (data.length < PER_PAGE) setHasMore(false);
                else setHasMore(true);

                if (pageNumber === 0) {
                    setDisasters(data || []);
                } else {
                    setDisasters(prev => [...prev, ...data]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchDisasters(nextPage);
    }, [page, fetchDisasters]);

    const createDisaster = async (disasterData) => {
        const result = await disasterModel.createDisaster(disasterData);
        if (!result.error) fetchDisasters(0);
        return result;
    };

    const updateDisaster = async (id, updates) => {
        const result = await disasterModel.updateDisaster(id, updates);
        if (!result.error) fetchDisasters(0);
        return result;
    };

    const deleteDisaster = async (id) => {
        const result = await disasterModel.deleteDisaster(id);
        if (!result.error) fetchDisasters(0);
        return result;
    };

    const approveDisaster = async (id) => {
        return await updateDisaster(id, { status: 'active' });
    };

    const markComplete = async (id) => {
        return await updateDisaster(id, { status: 'completed' });
    };

    useEffect(() => {
        fetchDisasters(0);

        const channel = disasterModel.subscribeToDisasters(() => fetchDisasters(0));

        return () => {
            disasterModel.removeChannel(channel);
        };
    }, [fetchDisasters]);

    return {
        disasters,
        pendingDisasters,
        loading,
        hasMore,
        loadMore,
        fetchDisasters,
        createDisaster,
        updateDisaster,
        deleteDisaster,
        approveDisaster,
        markComplete
    };
};

/**
 * Controller for Admin Medical Cases Management
 */
export const useAdminMedicalController = () => {
    const [cases, setCases] = useState([]);
    const [pendingCases, setPendingCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PER_PAGE = 10;

    const fetchCases = useCallback(async (pageNumber = 0) => {
        setLoading(true);
        try {
            // Fetch Pending
            const { data: pendingData } = await supabase
                .from('medical_cases')
                .select('*')
                .eq('status', 'pending');
            setPendingCases(pendingData || []);

            // Fetch Active/Completed
            const { data, error } = await medicalModel.fetchMedicalCases(pageNumber, PER_PAGE, 'active');

            if (error) console.error(error);
            else {
                if (data.length < PER_PAGE) setHasMore(false);
                else setHasMore(true);

                if (pageNumber === 0) setCases(data || []);
                else setCases(prev => [...prev, ...data]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCases(nextPage);
    }, [page, fetchCases]);

    const createCase = async (caseData) => {
        const result = await medicalModel.createMedicalCase({ ...caseData, status: 'active', volunteers_needed: 0 });
        if (!result.error) fetchCases(0);
        return result;
    };

    const updateCase = async (id, updates) => {
        const result = await medicalModel.updateMedicalCase(id, updates);
        if (!result.error) fetchCases(0);
        return result;
    };

    const deleteCase = async (id) => {
        const result = await medicalModel.deleteMedicalCase(id);
        if (!result.error) fetchCases(0);
        return result;
    };

    const approveCase = async (id) => {
        return await updateCase(id, { status: 'active' });
    };

    useEffect(() => {
        fetchCases(0);

        const channel = medicalModel.subscribeToMedicalCases(() => fetchCases(0));

        return () => {
            medicalModel.removeChannel(channel);
        };
    }, [fetchCases]);

    return {
        cases,
        pendingCases,
        loading,
        hasMore,
        loadMore,
        fetchCases,
        createCase,
        updateCase,
        deleteCase,
        approveCase
    };
};

/**
 * Controller for Admin Donations Management
 */
export const useAdminDonationsController = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PER_PAGE = 20;

    const fetchDonations = useCallback(async (pageNumber = 0) => {
        setLoading(true);
        try {
            const { data, error } = await donationModel.fetchAllDonations(pageNumber, PER_PAGE);

            if (error) {
                console.error("Error fetching donations:", error);
            } else {
                if (data.length < PER_PAGE) setHasMore(false);
                else setHasMore(true);

                if (pageNumber === 0) {
                    setDonations(data || []);
                } else {
                    setDonations(prev => {
                        const existingIds = new Set(prev.map(d => d.id));
                        const newItems = data.filter(d => !existingIds.has(d.id));
                        return [...prev, ...newItems];
                    });
                }
            }
        } catch (err) {
            console.error("Unexpected error fetching donations:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchDonations(nextPage);
    }, [page, fetchDonations]);

    const approveDonation = async (donationId, disasterId, amount) => {
        try {
            // Update Donation Status
            const { error: updateError } = await donationModel.updateDonationStatus(donationId, 'approved');
            if (updateError) throw updateError;

            // Update Disaster Funds
            const { data: disasterData, error: fetchError } = await supabase
                .from('disasters')
                .select('collected_amount')
                .eq('id', disasterId)
                .single();

            if (fetchError) throw fetchError;

            const newAmount = (disasterData.collected_amount || 0) + parseFloat(amount);

            const { error: fundError } = await supabase
                .from('disasters')
                .update({ collected_amount: newAmount })
                .eq('id', disasterId);

            if (fundError) throw fundError;

            fetchDonations(0);
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    const rejectDonation = async (donationId) => {
        const result = await donationModel.updateDonationStatus(donationId, 'rejected');
        if (!result.error) fetchDonations(0);
        return result;
    };

    useEffect(() => {
        fetchDonations(0);

        const channel = supabase
            .channel('admin-realtime-donations')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => fetchDonations(0))
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchDonations]);

    return {
        donations,
        loading,
        hasMore,
        loadMore,
        fetchDonations,
        approveDonation,
        rejectDonation
    };
};

/**
 * Controller for Admin Volunteer Applications
 */
export const useAdminVolunteerApplicationsController = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await volunteerModel.fetchVolunteerApplications();

            if (error) {
                console.error(error);
            } else {
                setApplications(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAction = async (appId, status, userId) => {
        try {
            // Update Application Status
            const { error: appError } = await volunteerModel.updateVolunteerApplicationStatus(appId, status);
            if (appError) throw appError;

            // If Approved, update user role to volunteer (unless already admin)
            if (status === 'approved') {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();

                if (profile?.role !== 'admin') {
                    const { error: roleError } = await supabase
                        .from('profiles')
                        .update({ role: 'volunteer' })
                        .eq('id', userId);

                    if (roleError) throw roleError;
                }
            }

            fetchApplications();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    useEffect(() => {
        fetchApplications();

        const channel = supabase
            .channel('admin-realtime-applications')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteer_applications' }, fetchApplications)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchApplications]);

    return {
        applications,
        loading,
        fetchApplications,
        approveApplication: (appId, userId) => handleAction(appId, 'approved', userId),
        rejectApplication: (appId, userId) => handleAction(appId, 'rejected', userId)
    };
};

/**
 * Controller for Admin Funds Management
 */
export const useAdminFundsController = () => {
    const [generalFund, setGeneralFund] = useState(0);
    const [zakatFund, setZakatFund] = useState(0);
    const [activeMissions, setActiveMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFunds = useCallback(async () => {
        setLoading(true);
        try {
            // Calculate General Fund Balance
            const { data: generalData } = await supabase
                .from('donations')
                .select('amount')
                .eq('donation_type', 'general')
                .eq('status', 'approved');

            const totalGeneral = generalData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
            setGeneralFund(totalGeneral);

            // Calculate Zakat Fund Balance
            const { data: zakatData } = await supabase
                .from('donations')
                .select('amount')
                .eq('donation_type', 'zakat')
                .eq('status', 'approved');

            const totalZakat = zakatData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
            setZakatFund(totalZakat);
        } catch (error) {
            console.error('Error fetching funds:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActiveMissions = useCallback(async () => {
        // Fetch Disasters
        const { data: disasters } = await supabase
            .from('disasters')
            .select('id, title')
            .eq('status', 'active');

        // Fetch Medical Cases
        const { data: medical } = await supabase
            .from('medical_cases')
            .select('id, title')
            .eq('status', 'active');

        const combined = [
            ...(disasters || []).map(d => ({ ...d, type: 'disaster' })),
            ...(medical || []).map(m => ({ ...m, type: 'medical' }))
        ];
        setActiveMissions(combined);
    }, []);

    const allocateFunds = async (missionId, missionType, amount, fundType) => {
        try {
            const sourceFund = fundType === 'general' ? generalFund : zakatFund;
            if (amount > sourceFund) {
                return { error: { message: 'Insufficient funds in selected pool.' } };
            }

            const { data: { user } } = await supabase.auth.getUser();

            // Deduct from Pool (Insert negative donation record)
            const { error: deductError } = await supabase.from('donations').insert({
                user_id: user.id,
                amount: -amount,
                donation_type: fundType,
                payment_method: 'allocation',
                phone_last_4: '0000',
                transaction_id: `ALLOC_TO_${missionId.slice(0, 8)}`,
                status: 'approved'
            });

            if (deductError) throw deductError;

            // Add to Target Mission
            const tableName = missionType === 'medical' ? 'medical_cases' : 'disasters';

            const { data: current, error: fetchErr } = await supabase
                .from(tableName)
                .select('collected_amount')
                .eq('id', missionId)
                .single();

            if (fetchErr) throw fetchErr;

            const { error: updateError } = await supabase
                .from(tableName)
                .update({ collected_amount: (current.collected_amount || 0) + amount })
                .eq('id', missionId);

            if (updateError) throw updateError;

            fetchFunds();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    useEffect(() => {
        fetchFunds();
        fetchActiveMissions();
    }, [fetchFunds, fetchActiveMissions]);

    return {
        generalFund,
        zakatFund,
        activeMissions,
        loading,
        fetchFunds,
        allocateFunds
    };
};

export default {
    useAdminOverviewController,
    useAdminDisastersController,
    useAdminMedicalController,
    useAdminDonationsController,
    useAdminVolunteerApplicationsController,
    useAdminFundsController
};
