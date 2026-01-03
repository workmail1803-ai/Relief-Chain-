/**
 * Auth Model - Handles all authentication-related data operations
 */

import { supabase } from '../supabaseClient';

// Login user with email and password
export const loginUser = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
};

// Signup user with full details
export const signupUser = async ({ email, password, fullName, phone, address }) => {
    return await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone_number: phone,
                address: address,
            },
        },
    });
};

// Sign out user
export const signOutUser = async () => {
    return await supabase.auth.signOut();
};

// Get current session
export const getSession = async () => {
    return await supabase.auth.getSession();
};

// Get user profile by ID
export const getUserProfile = async (userId) => {
    return await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
};

// Get user role by ID
export const getUserRole = async (userId) => {
    return await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
};

// Create user profile (self-healing)
export const createUserProfile = async (userId, email, fullName, role = 'user') => {
    return await supabase
        .from('profiles')
        .insert([{
            id: userId,
            email: email,
            full_name: fullName,
            role: role
        }]);
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
    return await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
};

// Subscribe to auth state changes
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback);
};

export default {
    loginUser,
    signupUser,
    signOutUser,
    getSession,
    getUserProfile,
    getUserRole,
    createUserProfile,
    updateUserProfile,
    onAuthStateChange
};
