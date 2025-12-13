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
                setIsAdmin(false);
            } else {
                setIsAdmin(data?.role === 'admin');
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
            }

            // 2. ONLY after initial check, set up the listener
            // This prevents `onAuthStateChange` from racing with the initial `getSession`
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                if (!mounted) return;

                console.log('Auth State Change:', event, currentSession?.user?.email);

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    await checkAdminRole(currentSession.user.id);
                } else {
                    setIsAdmin(false);
                }

                // Ensure loading is set to false once we have a definitive state from the listener
                setLoading(false);
            });

            authSubscription = subscription;

            // If we're still loading (e.g. no events fired yet, though they usually do),
            // we could force it off, but onAuthStateChange usually fires 'INITIAL_SESSION' immediately.
            // If it doesn't, we might hang on loading. 
            // Safeguard: if there was no initial session and no event fires immediately? 
            // Supabase guarantees an event on subscription.
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

        if (profileError || profile?.role !== 'admin') {
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
