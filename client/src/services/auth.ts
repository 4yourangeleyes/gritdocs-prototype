import { supabase } from '../lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  registrationNumber?: string;
  jurisdiction?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  companyName?: string;
  registrationNumber?: string;
  jurisdiction?: string;
  logoUrl?: string;
}

class AuthService {
  // Sign up with email and password
  async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    const { email, password, fullName, companyName, registrationNumber, jurisdiction } = data;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          registration_number: registrationNumber,
          jurisdiction: jurisdiction || 'New Zealand',
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    // Create profile automatically if user is created
    if (authData.user) {
      try {
        await this.createProfile(authData.user.id, {
          email: authData.user.email || email,
          fullName,
          companyName,
          registrationNumber,
          jurisdiction: jurisdiction || 'New Zealand',
        });
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't fail signup if profile creation fails
      }
    }

    return { user: authData.user, error: null };
  }

  // Sign in with email and password
  async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    const { email, password } = data;
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: authData.user, error: null };
  }

  // Sign in with Google OAuth
  async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    // Always redirect to production URL for deployed version
    const redirectUrl = window.location.hostname === 'gritdocs-mvp.netlify.app' 
      ? 'https://gritdocs-mvp.netlify.app/'
      : window.location.hostname === 'localhost'
      ? 'http://localhost:3000/'
      : `${window.location.origin}/`;
      
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    return { error };
  }

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Get user profile
  async getUserProfile(userId: string) {
    console.log('🔍 AuthService: Fetching profile for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ AuthService: Error fetching profile:', error);
        return null;
      }

      console.log('✅ AuthService: Profile fetched successfully:', data ? 'Found' : 'Not found');
      return data;
    } catch (err) {
      console.error('❌ AuthService: Exception in getUserProfile:', err);
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId: string, profileData: ProfileUpdateData) {
    const { error } = await (supabase
      .from('profiles') as any)
      .update({
        full_name: profileData.fullName,
        company_name: profileData.companyName || null,
        registration_number: profileData.registrationNumber || null,
        jurisdiction: profileData.jurisdiction,
        logo_url: profileData.logoUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return true;
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  }

  // Update password
  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    return { error };
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Upload profile logo
  async uploadLogo(userId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // Delete profile logo
  async deleteLogo(userId: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from('profiles')
      .remove([`${userId}/logo`]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  }

  // Create user profile (private method)
  private async createProfile(userId: string, profileData: {
    email: string;
    fullName: string;
    companyName?: string;
    registrationNumber?: string;
    jurisdiction?: string;
  }) {
    const { error } = await (supabase
      .from('profiles') as any)
      .insert({
        id: userId,
        email: profileData.email,
        full_name: profileData.fullName,
        company_name: profileData.companyName || null,
        registration_number: profileData.registrationNumber || null,
        jurisdiction: profileData.jurisdiction || 'New Zealand',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return true;
  }

  // Handle OAuth sign-in profile creation
  async handleOAuthProfile(user: User): Promise<void> {
    console.log('🔧 AuthService: Handling OAuth profile for user:', user.email);
    
    try {
      // Check if profile already exists
      console.log('🔍 AuthService: Checking for existing profile...');
      const existingProfile = await this.getUserProfile(user.id);
      
      if (!existingProfile) {
        console.log('📝 AuthService: Creating new OAuth profile...');
        // Create profile for OAuth users
        const metadata = user.user_metadata || {};
        await this.createProfile(user.id, {
          email: user.email || '',
          fullName: metadata.full_name || metadata.name || 'User',
          companyName: metadata.company_name,
          registrationNumber: metadata.registration_number,
          jurisdiction: 'New Zealand',
        });
        console.log('✅ AuthService: OAuth profile created successfully');
      } else {
        console.log('✅ AuthService: Profile already exists, skipping creation');
      }
    } catch (error) {
      console.error('❌ AuthService: Error in handleOAuthProfile:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();