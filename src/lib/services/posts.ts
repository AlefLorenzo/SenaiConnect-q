import { supabase, isSupabaseEnabled } from '../supabase';
import type { Post, Comment } from '../../store';

export interface DBPost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  likes?: Array<{ id: string; user_id: string }>;
  comments?: Array<DBComment>;
}

export interface DBComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export const postsService = {
  async getAll(): Promise<Post[]> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (id, name, avatar),
        likes (id, user_id),
        comments (
          id,
          post_id,
          user_id,
          content,
          created_at,
          users:users_comments_user_id_fkey (id, name, avatar)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.dbPostToAppPost);
  },

  async create(userId: string, content: string, imageUrl?: string): Promise<Post> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('posts')
      .insert({
        user_id: userId,
        content,
        image_url: imageUrl || null
      })
      .select(`
        *,
        users!posts_user_id_fkey (id, name, avatar)
      `)
      .single();

    if (error) throw error;
    return this.dbPostToAppPost(data);
  },

  async delete(postId: string, userId: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    // Check if already liked
    const { data: existing } = await supabase!
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      const { error } = await supabase!
        .from('likes')
        .delete()
        .eq('id', existing.id);
      
      if (error) throw error;
      return { liked: false };
    } else {
      // Like
      const { error } = await supabase!
        .from('likes')
        .insert({ post_id: postId, user_id: userId });
      
      if (error) throw error;
      return { liked: true };
    }
  },

  async addComment(postId: string, userId: string, content: string): Promise<Comment> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content
      })
      .select(`
        *,
        users:users_comments_user_id_fkey (id, name, avatar)
      `)
      .single();

    if (error) throw error;
    return this.dbCommentToAppComment(data);
  },

  async deleteComment(commentId: string, userId: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  dbPostToAppPost(dbPost: DBPost): Post {
    return {
      id: dbPost.id,
      userId: dbPost.user_id,
      userName: dbPost.users?.name || 'Unknown',
      userAvatar: dbPost.users?.avatar || '',
      content: dbPost.content,
      image: dbPost.image_url || undefined,
      likes: (dbPost.likes || []).map(l => l.user_id),
      comments: (dbPost.comments || []).map(c => this.dbCommentToAppComment(c)),
      createdAt: dbPost.created_at,
      saved: false // User-specific, should be tracked separately
    };
  },

  dbCommentToAppComment(dbComment: DBComment): Comment {
    return {
      id: dbComment.id,
      userId: dbComment.user_id,
      userName: dbComment.users?.name || 'Unknown',
      userAvatar: dbComment.users?.avatar || '',
      content: dbComment.content,
      createdAt: dbComment.created_at
    };
  }
};
