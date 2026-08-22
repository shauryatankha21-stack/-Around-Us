import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const STORE_KEY = 'around-us-v75';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { games: [], profile: null };
  } catch {
    return { games: [], profile: null };
  }
}

function writeLocal(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      // Local mode — restore from localStorage
      const data = readLocal();
      if (data.profile) {
        setProfile(data.profile);
        setCurrentUser({ id: data.profile.id, email: data.profile.email });
      }
      setLoading(false);
      return;
    }

    // Supabase mode — get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when user changes (Supabase mode)
  useEffect(() => {
    if (!supabase || !currentUser) {
      if (!supabase) return; // Local mode handled separately
      setProfile(null);
      return;
    }

    supabase
      .from('profiles')
      .select('name, college, city, gender')
      .eq('id', currentUser.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data || { name: currentUser.email?.split('@')[0] || 'User' });
      });
  }, [currentUser]);

  const signUp = useCallback(async ({ email, password, name, college, city, date_of_birth, gender }) => {
    if (!supabase) {
      // Local mode
      const localProfile = { id: 'local-user', name, email, college, city, date_of_birth, gender: gender || 'Any' };
      const data = readLocal();
      data.profile = localProfile;
      writeLocal(data);
      setProfile(localProfile);
      setCurrentUser({ id: localProfile.id, email });
      return { error: null, needsConfirmation: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, college, city, date_of_birth, gender: gender || 'Any' } },
    });

    if (error) return { error: error.message, needsConfirmation: false };
    if (!data.session) return { error: null, needsConfirmation: true };

    setCurrentUser(data.user);
    setProfile({ name, college, city, gender: gender || 'Any' });
    return { error: null, needsConfirmation: false };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) {
      // Local mode
      const data = readLocal();
      if (!data.profile) return { error: 'Create an account first.' };
      setProfile(data.profile);
      setCurrentUser({ id: data.profile.id, email: data.profile.email });
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    setCurrentUser(data.user);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      localStorage.removeItem(STORE_KEY);
      setCurrentUser(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
  }, []);

  const value = {
    currentUser,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
