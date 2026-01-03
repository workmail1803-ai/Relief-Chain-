/**
 * useAuth Controller - Custom hook for authentication logic
 */

import { useState, useEffect, useCallback } from 'react';
import * as authModel from '../models/authModel';

export const useAuthController = () => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isVolunteer, setIsVolunteer] = useState(false);

    const checkRole = useCallback(async (userId) => {
        try {
            const { data, error } = await authModel.getUserRole(userId);

            if (error) {
                if (error.code === 'PGRST116') {
                    // Profile missing, try self-healing
                    console.log("Profile missing, attempting self-healing...");
                    const { data: { session } } = await authModel.getSession();
                    const userMeta = session?.user?.user_metadata || {};

                    const { error: createError } = await authModel.createUserProfile(
                        userId,
                        session?.user?.email || 'unknown@example.com',
                        userMeta.full_name || 'Restored User',
                        'user'
                    );

                    if (createError) {
                        console.error("Failed to self-heal profile:", createError);
                    } else {
                        console.log("Profile restored successfully.");
                        const { data: retryData } = await authModel.getUserRole(userId);
                        const role = retryData?.role;
                        setIsAdmin(role === 'admin');
                        setIsVolunteer(role === 'volunteer');
                        return;
                    }
                } else {
                    console.error('Error checking role:', error);
                }
                setIsAdmin(false);
                setIsVolunteer(false);
                return;
            }

            const role = data?.role;
            setIsAdmin(role === 'admin');
            setIsVolunteer(role === 'volunteer');

        } catch (err) {
            console.error('Unexpected error checking role:', err);
            setIsAdmin(false);
            setIsVolunteer(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        let authSubscription = null;

        const initializeAuth = async () => {
            try {
                const { data: { session: initialSession } } = await authModel.getSession();

                if (mounted) {
                    if (initialSession) {
                        setSession(initialSession);
                        setUser(initialSession.user);
                        await checkRole(initialSession.user.id);
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            }

            const { data: { subscription } } = authModel.onAuthStateChange(async (event, currentSession) => {
                if (!mounted) return;

                console.log('Auth State Change:', event, currentSession?.user?.email);

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    await checkRole(currentSession.user.id);
                } else {
                    setIsAdmin(false);
                    setIsVolunteer(false);
                }

                setLoading(false);
            });

            authSubscription = subscription;
        };

        initializeAuth();

        return () => {
            mounted = false;
            if (authSubscription) {
                authSubscription.unsubscribe();
            }
        };
    }, [checkRole]);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        const result = await authModel.loginUser(email, password);
        if (result.error) {
            setLoading(false);
        }
        return result;
    }, []);

    const signup = useCallback(async ({ email, password, fullName, phone, address }) => {
        return await authModel.signupUser({ email, password, fullName, phone, address });
    }, []);

    const logout = useCallback(async () => {
        setIsAdmin(false);
        setIsVolunteer(false);
        setUser(null);
        setSession(null);
        return await authModel.signOutUser();
    }, []);

    const adminLogin = useCallback(async (email, password) => {
        setLoading(true);

        const { data, error } = await authModel.loginUser(email, password);

        if (error) {
            setLoading(false);
            return { data, error };
        }

        const { data: profile, error: profileError } = await authModel.getUserRole(data.user.id);

        const role = profile?.role?.toLowerCase();

        if (profileError || role !== 'admin') {
            await logout();
            setLoading(false);
            return {
                error: { message: 'Unauthorized: Access restricted to administrators.' }
            };
        }

        setIsAdmin(true);
        setLoading(false);
        return { data, error: null };
    }, [logout]);

    return {
        user,
        session,
        isAdmin,
        isVolunteer,
        loading,
        login,
        signup,
        logout,
        adminLogin
    };
};

export default useAuthController;
