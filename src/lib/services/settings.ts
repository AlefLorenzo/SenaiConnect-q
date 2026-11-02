import { supabase, isSupabaseEnabled } from '../supabase';
import type { Settings } from '../../store';

export interface DBSettings {
  user_id: string;
  notifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    groups: boolean;
    notices: boolean;
    messages: boolean;
  };
  privacy: {
    showEmail: boolean;
    showCourse: boolean;
    allowMessages: boolean;
  };
  appearance: {
    compactMode: boolean;
    reduceAnimations: boolean;
  };
  updated_at: string;
}

export const settingsService = {
  async get(userId: string): Promise<Settings | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    const { data, error } = await supabase!
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return null
        return null;
      }
      throw error;
    }

    return data as Settings;
  },

  async upsert(userId: string, settings: Partial<Settings>): Promise<Settings> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as Settings;
  }
};

export interface DBNotification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'group' | 'notice';
  message: string;
  from_user: string | null;
  from_avatar: string | null;
  read: boolean;
  created_at: string;
}

export const notificationsService = {
  async getAll(userId: string): Promise<DBNotification[]> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markAsRead(notificationId: string, userId: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  async create(
    userId: string,
    type: DBNotification['type'],
    message: string,
    fromUser?: string,
    fromAvatar?: string
  ) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        message,
        from_user: fromUser || null,
        from_avatar: fromAvatar || null
      });

    if (error) throw error;
  }
};
