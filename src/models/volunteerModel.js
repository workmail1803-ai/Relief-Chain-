/**
 * Volunteer Model - Handles all volunteer-related data operations
 */

import { supabase } from '../supabaseClient';

// Fetch all volunteers
export const fetchVolunteers = async (excludeUserId = null) => {
    let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'volunteer');

    if (excludeUserId) {
        query = query.neq('id', excludeUserId);
    }

    return await query;
};

// Get volunteers count
export const getVolunteersCount = async () => {
    return await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'volunteer');
};

// Fetch volunteer applications
export const fetchVolunteerApplications = async () => {
    return await supabase
        .from('volunteer_applications')
        .select(`*, profiles(full_name, email)`)
        .order('created_at', { ascending: false });
};

// Create volunteer application
export const createVolunteerApplication = async (applicationData) => {
    return await supabase
        .from('volunteer_applications')
        .insert([applicationData]);
};

// Get user's volunteer application
export const getUserVolunteerApplication = async (userId) => {
    return await supabase
        .from('volunteer_applications')
        .select('*')
        .eq('user_id', userId)
        .single();
};

// Update volunteer application status
export const updateVolunteerApplicationStatus = async (id, status) => {
    return await supabase
        .from('volunteer_applications')
        .update({ status })
        .eq('id', id);
};

// Fetch disaster volunteers
export const fetchDisasterVolunteers = async () => {
    return await supabase
        .from('disaster_volunteers')
        .select(`*, profiles(full_name, email, phone_number), disasters(title)`)
        .order('created_at', { ascending: false });
};

// Check if user is volunteer for a disaster
export const checkVolunteerStatus = async (disasterId, userId) => {
    return await supabase
        .from('disaster_volunteers')
        .select('id')
        .eq('disaster_id', disasterId)
        .eq('user_id', userId)
        .maybeSingle();
};

// Join disaster as volunteer
export const joinDisasterAsVolunteer = async (disasterId, userId) => {
    return await supabase
        .from('disaster_volunteers')
        .insert([{ disaster_id: disasterId, user_id: userId }]);
};

// Leave disaster as volunteer
export const leaveDisasterAsVolunteer = async (disasterId, userId) => {
    return await supabase
        .from('disaster_volunteers')
        .delete()
        .eq('disaster_id', disasterId)
        .eq('user_id', userId);
};

// Fetch user volunteer activities
export const fetchUserVolunteerActivities = async (userId) => {
    return await supabase
        .from('disaster_volunteers')
        .select(`
            *,
            disasters(title, location, image_url, severity)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
};

// Invite user to disaster
export const inviteUserToDisaster = async (userId, disasterId, status = 'invited') => {
    return await supabase
        .from('disaster_volunteers')
        .insert([{
            user_id: userId,
            disaster_id: disasterId,
            status: status
        }]);
};

// Update volunteer status for disaster
export const updateVolunteerStatusForDisaster = async (userId, disasterId, status) => {
    return await supabase
        .from('disaster_volunteers')
        .update({ status })
        .eq('user_id', userId)
        .eq('disaster_id', disasterId);
};

// Get user ID by email (RPC function)
export const getUserIdByEmail = async (email) => {
    return await supabase.rpc('get_user_id_by_email', { user_email: email });
};

// Subscribe to disaster volunteers changes
export const subscribeToDisasterVolunteers = (disasterId, callback) => {
    const channel = supabase
        .channel(`disaster-volunteers-${disasterId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'disaster_volunteers', filter: `disaster_id=eq.${disasterId}` },
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
    fetchVolunteers,
    getVolunteersCount,
    fetchVolunteerApplications,
    createVolunteerApplication,
    getUserVolunteerApplication,
    updateVolunteerApplicationStatus,
    fetchDisasterVolunteers,
    checkVolunteerStatus,
    joinDisasterAsVolunteer,
    leaveDisasterAsVolunteer,
    fetchUserVolunteerActivities,
    inviteUserToDisaster,
    updateVolunteerStatusForDisaster,
    getUserIdByEmail,
    subscribeToDisasterVolunteers,
    removeChannel
};
