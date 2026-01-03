/**
 * useProfile Controller - Custom hook for user profile logic
 */

import { useState, useEffect, useCallback } from 'react';
import * as authModel from '../models/authModel';
import * as donationModel from '../models/donationModel';
import * as volunteerModel from '../models/volunteerModel';
import * as storageModel from '../models/storageModel';
import { supabase } from '../supabaseClient';

export const useProfileController = (userId) => {
    const [profile, setProfile] = useState(null);
    const [donations, setDonations] = useState([]);
    const [volunteerActivities, setVolunteerActivities] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!userId) return;
        
        try {
            setLoading(true);

            // Fetch Profile
            const { data: profileData, error: profileError } = await authModel.getUserProfile(userId);
            if (!profileError) {
                setProfile(profileData);
                if (profileData?.avatar_url) setAvatarUrl(profileData.avatar_url);
            }

            // Fetch Donations
            const { data: donationData, error: donationError } = await donationModel.fetchUserDonations(userId);
            if (!donationError) setDonations(donationData || []);

            // Fetch Volunteer Activities
            const { data: volData, error: volError } = await volunteerModel.fetchUserVolunteerActivities(userId);
            if (!volError) setVolunteerActivities(volData || []);

        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel(`profile-${userId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'donations', filter: `user_id=eq.${userId}` },
                () => fetchData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'disaster_volunteers', filter: `user_id=eq.${userId}` },
                () => fetchData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchData]);

    const uploadAvatar = useCallback(async (file) => {
        if (!file || !userId) return { error: 'Invalid file or user' };

        try {
            setUploading(true);
            const publicUrl = await storageModel.uploadAvatar(userId, file);

            const { error: updateError } = await authModel.updateUserProfile(userId, { avatar_url: publicUrl });
            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            return { success: true };
        } catch (error) {
            console.error('Error uploading avatar:', error);
            return { error: error.message };
        } finally {
            setUploading(false);
        }
    }, [userId]);

    // Calculate stats
    const totalDonated = donations
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + Number(d.amount), 0);

    const campaignsSupported = new Set(donations.map(d => d.disaster_id)).size;

    const completedMissions = volunteerActivities.filter(v => v.status === 'completed').length;

    return {
        profile,
        donations,
        volunteerActivities,
        avatarUrl,
        loading,
        uploading,
        uploadAvatar,
        totalDonated,
        campaignsSupported,
        completedMissions,
        refetch: fetchData
    };
};

export default useProfileController;
