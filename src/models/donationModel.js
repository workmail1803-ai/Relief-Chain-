/**
 * Donation Model - Handles all donation-related data operations
 */

import { supabase } from '../supabaseClient';

// Create a donation
export const createDonation = async (donationData) => {
    return await supabase
        .from('donations')
        .insert([donationData]);
};

// Fetch user donations
export const fetchUserDonations = async (userId) => {
    return await supabase
        .from('donations')
        .select(`
            *,
            disasters(title, image_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
};

// Fetch all donations (admin)
export const fetchAllDonations = async (page = 0, perPage = 20) => {
    const from = page * perPage;
    const to = from + perPage - 1;

    return await supabase
        .from('donations')
        .select(`
            *,
            profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);
};

// Update donation status (approve/reject)
export const updateDonationStatus = async (id, status) => {
    return await supabase
        .from('donations')
        .update({ status })
        .eq('id', id);
};

// Get general fund total
export const getGeneralFundTotal = async () => {
    return await supabase
        .from('donations')
        .select('amount')
        .eq('donation_type', 'general');
};

// Subscribe to donations changes
export const subscribeToDonations = (userId, callback) => {
    const channel = supabase
        .channel(`donations-${userId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'donations', filter: `user_id=eq.${userId}` },
            callback
        )
        .subscribe();

    return channel;
};

// Remove channel subscription
export const removeChannel = (channel) => {
    supabase.removeChannel(channel);
};

export default {
    createDonation,
    fetchUserDonations,
    fetchAllDonations,
    updateDonationStatus,
    getGeneralFundTotal,
    subscribeToDonations,
    removeChannel
};
