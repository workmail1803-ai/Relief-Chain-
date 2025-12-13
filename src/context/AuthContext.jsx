import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Helper to check admin role and handle loading state
    const checkAdminRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching role:', error);
                // Do not immediately revoke admin if it's a transient error, 
                // but for security we usually default to false.
                // However, to avoid flickering on transient errors, we might check if we already have admin.
                // For now, let's keep it safe but log it.
                setIsAdmin(false);
            } else {
                // Case-insensitive check
                const role = data?.role?.toLowerCase();
                setIsAdmin(role === 'admin');
            }
        } catch (err) {
            console.error('Unexpected error checking role:', err);
            setIsAdmin(false);
        }
        // We do NOT set loading(false) here automatically anymore to prevent race conditions
        // We let the caller handle the loading state finalization
    };

    useEffect(() => {
        let mounted = true;
        let authSubscription = null;

        const initializeAuth = async () => {
            try {
                // 1. Get initial session first to explicitly check state
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                if (mounted) {
                    if (initialSession) {
                        setSession(initialSession);
                        setUser(initialSession.user);
                        // Important: Check role immediately if we have a session
                        await checkAdminRole(initialSession.user.id);
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                // If no session found initially, we should stop loading (unless listener picks it up)
                // But wait for listener to confirm.
            }

            // 2. ONLY after initial check, set up the listener
            // This prevents `onAuthStateChange` from racing with the initial `getSession`
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                if (!mounted) return;

                console.log('Auth State Change:', event, currentSession?.user?.email);

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    // Only check role if it's a relevant event, or always to be safe?
                    // Always checking is safer but slower.
                    await checkAdminRole(currentSession.user.id);
                } else {
                    setIsAdmin(false);
                }

                // Ensure loading is set to false once we have a definitive state from the listener
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
    }, []);

    const login = (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signup = async ({ email, password, fullName, phone, address }) => {
        const { data, error } = await supabase.auth.signUp({
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
        return { data, error };
    };

    const logout = () => {
        setIsAdmin(false);
        setUser(null);
        setSession(null);
        return supabase.auth.signOut();
    };

    const adminLogin = async (email, password) => {
        setLoading(true); // Start loading UI

        // 1. Sign out any existing session first to ensure clean state? 
        // Can be useful if user was logged in as regular user.
        // But might be jarring. Let's rely on signInWithPassword switching it.

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setLoading(false);
            return { data, error };
        }

        // Verify if user is actually admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        const role = profile?.role?.toLowerCase();

        if (profileError || role !== 'admin') {
            await logout(); // Log them out immediately if not admin
            setLoading(false);
            return {
                error: { message: 'Unauthorized: Access restricted to administrators.' }
            };
        }

        setIsAdmin(true);
        setLoading(false);
        return { data, error: null };
    };

    const value = {
        user,
        session,
        isAdmin,
        login,
        signup,
        logout,
        adminLogin,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
};
