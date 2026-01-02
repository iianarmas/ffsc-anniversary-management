import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, getUserProfile, onAuthStateChange, signOut as supabaseSignOut } from '../../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      setLoading(false);
      
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
        const { user: currentUser } = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          loadProfile(currentUser.id);
        } else {
          setUser(null);
          setProfile(null);
        }
    } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
        setProfile(null);
    } finally {
        setLoading(false);
    }
  };

  const loadProfile = async (userId) => {
    try {
        const { data, error } = await getUserProfile(userId);
        if (!error && data) {
          setProfile(data);
        } else {
          console.error('Failed to load profile:', error);
          setProfile(null);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
    }
  };

  const signOut = async () => {
    try {
      const { signOut: supabaseSignOut } = await import('../../services/supabase');
      await supabaseSignOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isVolunteer: profile?.role === 'volunteer',
    isViewer: profile?.role === 'viewer',
    refreshProfile: () => user ? loadProfile(user.id) : null,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}