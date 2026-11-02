import { supabase, isSupabaseEnabled } from '../supabase';
import type { User } from '../../store';

export interface DBUser {
  id: string;
  email: string;
  name: string;
  role: 'Aluno' | 'Professor' | 'Admin';
  avatar: string | null;
  bio: string | null;
  course: string | null;
  interests: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const authService = {
  async signUp(email: string, password: string, name: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    if (!isSupabaseEnabled()) {
      return null;
    }

    const { data: { user } } = await supabase!.auth.getUser();
    return user;
  },

  async getUserProfile(userId: string): Promise<DBUser | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<DBUser>) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  },

  dbUserToAppUser(dbUser: DBUser): User {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatar: dbUser.avatar || '',
      bio: dbUser.bio || '',
      course: dbUser.course || '',
      interests: dbUser.interests || [],
      onboardingCompleted: dbUser.onboarding_completed
    };
  }
};
