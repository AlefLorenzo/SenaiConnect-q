import { supabase, isSupabaseEnabled } from '../supabase';
import type { Message, Conversation } from '../../store';

export interface DBMessage {
  id: string;
  from_id: string;
  to_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  receiver?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export const messagesService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    // Get all messages involving the user
    const { data, error } = await supabase!
      .from('messages')
      .select(`
        *,
        sender:users!messages_from_id_fkey (id, name, avatar),
        receiver:users!messages_to_id_fkey (id, name, avatar)
      `)
      .or(`from_id.eq.${userId},to_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by conversation partner
    const conversationsMap = new Map<string, {
      userId: string;
      userName: string;
      userAvatar: string;
      lastMessage: string;
      lastTime: string;
      unread: number;
    }>();

    (data || []).forEach((msg: DBMessage) => {
      const otherUserId = msg.from_id === userId ? msg.to_id : msg.from_id;
      const otherUser = msg.from_id === userId ? msg.receiver : msg.sender;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          userName: otherUser?.name || 'Unknown',
          userAvatar: otherUser?.avatar || '',
          lastMessage: msg.content,
          lastTime: msg.created_at,
          unread: 0
        });
      }

      // Count unread messages
      if (msg.to_id === userId && !msg.read) {
        conversationsMap.get(otherUserId)!.unread++;
      }
    });

    return Array.from(conversationsMap.values());
  },

  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('messages')
      .select('*')
      .or(
        `and(from_id.eq.${userId1},to_id.eq.${userId2}),and(from_id.eq.${userId2},to_id.eq.${userId1})`
      )
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(this.dbMessageToAppMessage);
  },

  async send(fromId: string, toId: string, content: string): Promise<Message> {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('messages')
      .insert({
        from_id: fromId,
        to_id: toId,
        content,
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    return this.dbMessageToAppMessage(data);
  },

  async markAsRead(messageIds: string[]) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!
      .from('messages')
      .update({ read: true })
      .in('id', messageIds);

    if (error) throw error;
  },

  async markConversationAsRead(userId: string, otherUserId: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!
      .from('messages')
      .update({ read: true })
      .eq('from_id', otherUserId)
      .eq('to_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  async delete(messageId: string, userId: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase!
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('from_id', userId);

    if (error) throw error;
  },

  subscribeToMessages(userId: string, callback: (payload: any) => void) {
    if (!isSupabaseEnabled()) {
      return null;
    }

    return supabase!
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  dbMessageToAppMessage(dbMessage: DBMessage): Message {
    return {
      id: dbMessage.id,
      fromId: dbMessage.from_id,
      toId: dbMessage.to_id,
      content: dbMessage.content,
      createdAt: dbMessage.created_at,
      read: dbMessage.read
    };
  }
};
