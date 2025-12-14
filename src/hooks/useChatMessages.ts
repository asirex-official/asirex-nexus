import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: "user" | "agent" | "bot";
  sender_id: string | null;
  message: string;
  created_at: string;
}

interface ChatConversation {
  id: string;
  user_id: string | null;
  status: "open" | "closed" | "pending";
  created_at: string;
  updated_at: string;
}

export function useChatMessages() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Create or get existing conversation
  const initConversation = async () => {
    if (!user) return null;

    setLoading(true);
    try {
      // Check for existing open conversation
      const { data: existing } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setConversationId(existing.id);
        await loadMessages(existing.id);
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, status: "open" })
        .select()
        .single();

      if (error) throw error;
      
      setConversationId(newConv.id);
      
      // Add welcome message
      await addMessage(newConv.id, "👋 Hi! Welcome to ASIREX Support. How can we help you today?", "bot");
      
      return newConv.id;
    } catch (error) {
      console.error("Error initializing conversation:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as ChatMessage[]);
    }
  };

  const addMessage = async (convId: string, text: string, senderType: "user" | "agent" | "bot", senderId?: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: convId,
        message: text,
        sender_type: senderType,
        sender_id: senderId || null,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data as ChatMessage]);
    }
    return data;
  };

  const sendMessage = async (text: string) => {
    if (!conversationId || !text.trim()) return;

    await addMessage(conversationId, text, "user", user?.id);

    // Update conversation timestamp
    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString(), status: "pending" })
      .eq("id", conversationId);
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return {
    conversationId,
    messages,
    loading,
    initConversation,
    sendMessage,
  };
}

// Hook for admin to manage all chats
export function useAdminChats(onNewMessage?: (message: ChatMessage, userName: string) => void) {
  const [conversations, setConversations] = useState<(ChatConversation & { user_email?: string; last_message?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Load last message and user info for each conversation
      const enrichedConversations = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: msgs } = await supabase
            .from("chat_messages")
            .select("message")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);

          let userEmail = "Anonymous";
          if (conv.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", conv.user_id)
              .single();
            userEmail = profile?.full_name || "User";
          }

          return {
            ...conv,
            user_email: userEmail,
            last_message: msgs?.[0]?.message || "No messages",
          };
        })
      );

      setConversations(enrichedConversations as any);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConversationMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as ChatMessage[];
  };

  const sendAgentReply = async (convId: string, message: string, agentId: string) => {
    const { error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: convId,
        message,
        sender_type: "agent",
        sender_id: agentId,
      });

    if (error) throw error;

    // Update conversation status
    await supabase
      .from("chat_conversations")
      .update({ status: "open", updated_at: new Date().toISOString() })
      .eq("id", convId);
  };

  const closeConversation = async (convId: string) => {
    await supabase
      .from("chat_conversations")
      .update({ status: "closed" })
      .eq("id", convId);
    await loadConversations();
  };

  const clearNewMessageCount = () => {
    setNewMessageCount(0);
  };

  useEffect(() => {
    loadConversations();

    // Subscribe to new conversations
    const conversationChannel = supabase
      .channel("admin-chats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        () => loadConversations()
      )
      .subscribe();

    // Subscribe to new messages from users (not from agents)
    const messageChannel = supabase
      .channel("admin-new-messages")
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "chat_messages"
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Only notify for user messages, not agent or bot messages
          if (newMessage.sender_type === "user") {
            setNewMessageCount(prev => prev + 1);
            
            // Get user name for notification
            let userName = "User";
            if (newMessage.sender_id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("user_id", newMessage.sender_id)
                .single();
              userName = profile?.full_name || "User";
            }
            
            // Call the callback if provided
            if (onNewMessage) {
              onNewMessage(newMessage, userName);
            }
            
            // Refresh conversations list
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [onNewMessage]);

  return {
    conversations,
    loading,
    newMessageCount,
    loadConversations,
    getConversationMessages,
    sendAgentReply,
    closeConversation,
    clearNewMessageCount,
  };
}
