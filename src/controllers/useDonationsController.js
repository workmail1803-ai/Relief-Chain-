/**
 * useDonations Controller - Custom hook for donations logic
 */

import { useState, useCallback } from 'react';
import * as donationModel from '../models/donationModel';

export const useDonationsController = () => {
    const [loading, setLoading] = useState(false);

    const submitDonation = useCallback(async (donationData) => {
        setLoading(true);
        try {
            const { error } = await donationModel.createDonation(donationData);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { error };
        } finally {
            setLoading(false);
        }
    }, []);

    const calculateZakat = useCallback((savings, goldSilver) => {
        const totalAssets = parseFloat(savings || 0) + parseFloat(goldSilver || 0);
        if (totalAssets > 0) {
            return {
                netWorth: totalAssets,
                amount: (totalAssets * 0.025).toFixed(2)
            };
        }
        return { netWorth: 0, amount: 0 };
    }, []);

    return {
        loading,
        submitDonation,
        calculateZakat
    };
};

export const useUserDonations = (userId) => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDonations = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        const { data, error } = await donationModel.fetchUserDonations(userId);
        if (!error) setDonations(data || []);
        setLoading(false);
    }, [userId]);

    return { donations, loading, fetchDonations };
};

export default useDonationsController;
