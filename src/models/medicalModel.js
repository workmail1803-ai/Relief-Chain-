/**
 * Medical Model - Handles all medical case-related data operations
 */

import { supabase } from '../supabaseClient';

// Fetch medical cases with pagination
export const fetchMedicalCases = async (page = 0, perPage = 9, status = 'active') => {
    const from = page * perPage;
    const to = from + perPage - 1;

    return await supabase
        .from('medical_cases')
        .select('id, title, hospital_name, condition, target_amount, collected_amount, image_url, is_urgent, created_at, severity')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(from, to);
};

// Fetch single medical case by ID
export const fetchMedicalCaseById = async (id) => {
    return await supabase
        .from('medical_cases')
        .select('*')
        .eq('id', id)
        .single();
};

// Fetch recent medical cases
export const fetchRecentMedicalCases = async (limit = 3) => {
    return await supabase
        .from('medical_cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
};

// Create new medical case
export const createMedicalCase = async (caseData) => {
    return await supabase
        .from('medical_cases')
        .insert([caseData]);
};

// Update medical case
export const updateMedicalCase = async (id, updates) => {
    return await supabase
        .from('medical_cases')
        .update(updates)
        .eq('id', id);
};

// Delete medical case
export const deleteMedicalCase = async (id) => {
    return await supabase
        .from('medical_cases')
        .delete()
        .eq('id', id);
};

// Get active medical cases count
export const getActiveMedicalCasesCount = async () => {
    return await supabase
        .from('medical_cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
};

// Get total medical funds
export const getTotalMedicalFunds = async () => {
    return await supabase
        .from('medical_cases')
        .select('collected_amount');
};

// Subscribe to medical cases changes
export const subscribeToMedicalCases = (callback) => {
    const channel = supabase
        .channel('realtime-medical-feed')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'medical_cases' },
            callback
        )
        .subscribe();

    return channel;
};

// Subscribe to single medical case changes
export const subscribeToMedicalCase = (id, callback) => {
    const channel = supabase
        .channel(`medical-${id}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'medical_cases', filter: `id=eq.${id}` },
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
    fetchMedicalCases,
    fetchMedicalCaseById,
    fetchRecentMedicalCases,
    createMedicalCase,
    updateMedicalCase,
    deleteMedicalCase,
    getActiveMedicalCasesCount,
    getTotalMedicalFunds,
    subscribeToMedicalCases,
    subscribeToMedicalCase,
    removeChannel
};
