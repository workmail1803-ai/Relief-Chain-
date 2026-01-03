/**
 * useVolunteers Controller - Custom hook for volunteer management logic
 */

import { useState, useEffect, useCallback } from 'react';
import * as volunteerModel from '../models/volunteerModel';

export const useVolunteersController = (excludeUserId = null) => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVolunteers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await volunteerModel.fetchVolunteers(excludeUserId);
        if (!error) setVolunteers(data || []);
        setLoading(false);
    }, [excludeUserId]);

    useEffect(() => {
        fetchVolunteers();
    }, [fetchVolunteers]);

    return { volunteers, loading, fetchVolunteers };
};

export const useVolunteerApplication = (userId) => {
    const [existingApplication, setExistingApplication] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkExistingApplication = useCallback(async () => {
        if (!userId) return;
        const { data } = await volunteerModel.getUserVolunteerApplication(userId);
        if (data) setExistingApplication(data);
    }, [userId]);

    useEffect(() => {
        checkExistingApplication();
    }, [checkExistingApplication]);

    const submitApplication = useCallback(async (applicationData) => {
        setLoading(true);
        try {
            const { error } = await volunteerModel.createVolunteerApplication({
                user_id: userId,
                ...applicationData
            });
            if (error) throw error;
            await checkExistingApplication();
            return { success: true };
        } catch (error) {
            return { error };
        } finally {
            setLoading(false);
        }
    }, [userId, checkExistingApplication]);

    return {
        existingApplication,
        loading,
        submitApplication,
        checkExistingApplication
    };
};

export const useDisasterVolunteer = (disasterId, userId) => {
    const [isVolunteer, setIsVolunteer] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkStatus = useCallback(async () => {
        if (!userId || !disasterId) return;
        const { data, error } = await volunteerModel.checkVolunteerStatus(disasterId, userId);
        if (!error) setIsVolunteer(!!data);
    }, [disasterId, userId]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const toggleVolunteer = useCallback(async () => {
        if (!userId) {
            return { error: { message: 'Please login to join as a volunteer.' } };
        }

        setLoading(true);
        try {
            if (isVolunteer) {
                const { error } = await volunteerModel.leaveDisasterAsVolunteer(disasterId, userId);
                if (error) throw error;
                setIsVolunteer(false);
                return { success: true, action: 'left' };
            } else {
                const { error } = await volunteerModel.joinDisasterAsVolunteer(disasterId, userId);
                if (error) throw error;
                setIsVolunteer(true);
                return { success: true, action: 'joined' };
            }
        } catch (error) {
            return { error };
        } finally {
            setLoading(false);
        }
    }, [disasterId, userId, isVolunteer]);

    return { isVolunteer, loading, toggleVolunteer, setIsVolunteer };
};

export default useVolunteersController;
