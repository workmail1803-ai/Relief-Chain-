/**
 * Disaster Model - Handles all disaster-related data operations
 */

import { supabase } from '../supabaseClient';

// Fetch disasters with pagination
export const fetchDisasters = async (page = 0, perPage = 9, status = 'active') => {
    const from = page * perPage;
    const to = from + perPage - 1;

    return await supabase
        .from('disasters')
        .select('id, title, location, target_amount, collected_amount, image_url, is_urgent, created_at')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(from, to);
};

// Fetch single disaster by ID
export const fetchDisasterById = async (id) => {
    return await supabase
        .from('disasters')
        .select('*')
        .eq('id', id)
        .single();
};

// Fetch urgent disasters
export const fetchUrgentDisasters = async (limit = 3) => {
    return await supabase
        .from('disasters')
        .select('*')
        .eq('is_urgent', true)
        .order('created_at', { ascending: false })
        .limit(limit);
};

// Fetch all disasters for admin with pagination
export const fetchAllDisastersAdmin = async (page = 0, perPage = 10) => {
    const from = page * perPage;
    const to = from + perPage - 1;

    return await supabase
        .from('disasters')
        .select('id, title, location, severity, target_amount, collected_amount, assigned_volunteers_count, volunteers_needed, is_urgent, created_at, status')
        .neq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(from, to);
};

// Fetch pending disasters
export const fetchPendingDisasters = async () => {
    return await supabase
        .from('disasters')
        .select('*')
        .eq('status', 'pending');
};

// Create new disaster
export const createDisaster = async (disasterData) => {
    return await supabase
        .from('disasters')
        .insert([disasterData]);
};

// Update disaster
export const updateDisaster = async (id, updates) => {
    return await supabase
        .from('disasters')
        .update(updates)
        .eq('id', id);
};

// Delete disaster
export const deleteDisaster = async (id) => {
    return await supabase
        .from('disasters')
        .delete()
        .eq('id', id);
};

// Get active disasters count
export const getActiveDisastersCount = async () => {
    return await supabase
        .from('disasters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
};

// Get total disaster funds
export const getTotalDisasterFunds = async () => {
    return await supabase
        .from('disasters')
        .select('collected_amount');
};

// Subscribe to disaster changes
export const subscribeToDisasters = (callback) => {
    const channel = supabase
        .channel('realtime-disasters-feed')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'disasters' },
            callback
        )
        .subscribe();

    return channel;
};

// Subscribe to single disaster changes
export const subscribeToDisaster = (id, callback) => {
    const channel = supabase
        .channel(`disaster-${id}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'disasters', filter: `id=eq.${id}` },
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
    fetchDisasters,
    fetchDisasterById,
    fetchUrgentDisasters,
    fetchAllDisastersAdmin,
    fetchPendingDisasters,
    createDisaster,
    updateDisaster,
    deleteDisaster,
    getActiveDisastersCount,
    getTotalDisasterFunds,
    subscribeToDisasters,
    subscribeToDisaster,
    removeChannel
};
