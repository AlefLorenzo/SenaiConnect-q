import { supabase, isSupabaseEnabled } from '../supabase';
import type { Story } from '../../store';

export interface DBStory {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string | null;
  expires_at: string;
  created_at: string;
  users?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  story_views?: Array<{ user_id: string }>;
}

export const storiesService = {
  async getActive(): Promise<Story[]> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('stories')
      .select(`
        *,
        users:users_stories_user_id_fkey (id, name, avatar),
        story_views (user_id)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.dbStoryToAppStory);
  },

  async create(
    userId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video',
    caption?: string
  ): Promise<Story> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data, error } = await supabase!
      .from('stories')
      .insert({
        user_id: userId,
        media_url: mediaUrl,
        media_type: mediaType,
        caption: caption || null,
        expires_at: expiresAt.toISOString()
      })
      .select(`
        *,
        users:users_stories_user_id_fkey (id, name, avatar)
      `)
      .single();

    if (error) throw error;
    return this.dbStoryToAppStory(data);
  },

  async addView(storyId: string, userId: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    // Check if already viewed
    const { data: existing } = await supabase!
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      const { error } = await supabase!
        .from('story_views')
        .insert({
          story_id: storyId,
          user_id: userId
        });

      if (error) throw error;
    }
  },

  async delete(storyId: string, userId: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async uploadMedia(file: File, userId: string): Promise<string> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase!.storage
      .from('stories')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase!.storage
      .from('stories')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  dbStoryToAppStory(dbStory: DBStory): Story {
    return {
      id: dbStory.id,
      userId: dbStory.user_id,
      userName: dbStory.users?.name || 'Unknown',
      userAvatar: dbStory.users?.avatar || '',
      mediaUrl: dbStory.media_url,
      mediaType: dbStory.media_type,
      caption: dbStory.caption || undefined,
      createdAt: dbStory.created_at,
      expiresAt: dbStory.expires_at,
      views: (dbStory.story_views || []).map(v => v.user_id)
    };
  }
};
