import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UnreadChatStats {
  totalUnread: number;
  openConversations: number;
  pendingConversations: number;
}

export const useUnreadChats = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<UnreadChatStats>({
    totalUnread: 0,
    openConversations: 0,
    pendingConversations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadStats = async () => {
    if (!user || !isAdmin) {
      setIsLoading(false);
      return;
    }

    try {
      // Get all open/pending conversations
      const { data: conversations, error: convError } = await supabase
        .from('chat_conversations')
        .select('id, status, updated_at')
        .in('status', ['open', 'pending']);

      if (convError) throw convError;

      const openCount = conversations?.filter(c => c.status === 'open').length || 0;
      const pendingCount = conversations?.filter(c => c.status === 'pending').length || 0;

      // Get unread messages (messages from users that haven't been replied to)
      // Count messages where sender_type is 'user' in open conversations
      const conversationIds = conversations?.map(c => c.id) || [];
      
      let unreadCount = 0;
      if (conversationIds.length > 0) {
        const { data: messages, error: msgError } = await supabase
          .from('chat_messages')
          .select('id, conversation_id, sender_type, created_at')
          .in('conversation_id', conversationIds)
          .eq('sender_type', 'user')
          .order('created_at', { ascending: false });

        if (msgError) throw msgError;

        // Count messages that are newer than the last agent reply in each conversation
        const conversationLastAgentReply = new Map<string, string>();
        
        // Get last agent reply for each conversation
        const { data: agentReplies } = await supabase
          .from('chat_messages')
          .select('conversation_id, created_at')
          .in('conversation_id', conversationIds)
          .eq('sender_type', 'agent')
          .order('created_at', { ascending: false });

        agentReplies?.forEach(reply => {
          if (!conversationLastAgentReply.has(reply.conversation_id)) {
            conversationLastAgentReply.set(reply.conversation_id, reply.created_at);
          }
        });

        // Count user messages that are newer than last agent reply
        messages?.forEach(msg => {
          const lastAgentReply = conversationLastAgentReply.get(msg.conversation_id);
          if (!lastAgentReply || new Date(msg.created_at) > new Date(lastAgentReply)) {
            unreadCount++;
          }
        });
      }

      setStats({
        totalUnread: unreadCount,
        openConversations: openCount,
        pendingConversations: pendingCount,
      });
    } catch (error) {
      console.error('Error fetching unread chat stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadStats();

    // Subscribe to real-time changes on chat_messages
    const messagesChannel = supabase
      .channel('unread-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          // If a new user message comes in, refetch stats
          if (payload.new && (payload.new as any).sender_type === 'user') {
            fetchUnreadStats();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
        },
        () => {
          // Refetch when conversations change
          fetchUnreadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, isAdmin]);

  return {
    ...stats,
    isLoading,
    refetch: fetchUnreadStats,
  };
};
