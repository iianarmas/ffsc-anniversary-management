import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, getUserProfile, onAuthStateChange } from '../../services/supabase';

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
    // Check current session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    console.log('Checking user...'); // DEBUG
    try {
        const { user: currentUser } = await getCurrentUser();
        console.log('Current user:', currentUser); // DEBUG
        if (currentUser) {
        setUser(currentUser);
        await loadProfile(currentUser.id);
        }
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        console.log('Setting loading to false'); // DEBUG
        setLoading(false);
    }
    };

  const loadProfile = async (userId) => {
    console.log('Loading profile for user:', userId); // DEBUG
    try {
        const { data, error } = await getUserProfile(userId);
        console.log('Profile data:', data, 'Error:', error); // DEBUG
        if (!error && data) {
        setProfile(data);
        } else {
        console.error('Failed to load profile:', error);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
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
    refreshProfile: () => user ? loadProfile(user.id) : null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}