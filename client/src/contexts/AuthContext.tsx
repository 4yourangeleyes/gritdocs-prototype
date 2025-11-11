import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { authService } from '../services/auth';
import type { Tables } from '../lib/supabase';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; fullName: string; companyName?: string; }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          const userProfile = await authService.getUserProfile(currentUser.id);
          setUser(currentUser);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Handle OAuth profile creation
        await authService.handleOAuthProfile(session.user);
        
        const userProfile = await authService.getUserProfile(session.user.id);
        setUser(session.user);
        setProfile(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: authUser, error } = await authService.signIn({ email, password });
      if (error) throw error;
      
      if (authUser) {
        const userProfile = await authService.getUserProfile(authUser.id);
        setUser(authUser);
        setProfile(userProfile);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; fullName: string; companyName?: string; }) => {
    setIsLoading(true);
    try {
      const { user: authUser, error } = await authService.signUp({
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        companyName: userData.companyName,
      });
      
      if (error) throw error;
      
      // Note: User will need to verify email before being fully authenticated
      if (authUser && authUser.email_confirmed_at) {
        const userProfile = await authService.getUserProfile(authUser.id);
        setUser(authUser);
        setProfile(userProfile);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Google login failed');
    }
  };

  const logout = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await authService.updateProfile(user.id, profileData);
      const updatedProfile = await authService.getUserProfile(user.id);
      setProfile(updatedProfile);
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const value = {
    user,
    profile,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}