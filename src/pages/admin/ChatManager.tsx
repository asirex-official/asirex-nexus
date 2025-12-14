import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { MessageSquare, Send, X, User, Bot, Headphones, Clock, CheckCircle, AlertCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminChats } from "@/hooks/useChatMessages";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: "user" | "agent" | "bot";
  sender_id: string | null;
  message: string;
  created_at: string;
}

export default function ChatManager() {
  const { user } = useAuth();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Callback for new message notifications
  const handleNewMessage = useCallback((message: ChatMessage, userName: string) => {
    // Play notification sound
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onq2Zt5lqaYh+ZF1zY3SGlZWZhW9eYHN8hZWanZCFend9gXt1cXl/iIx9b2tzgYuPkoyGfnpyb29ydXd9gIWJjIqCd21paHB5hI2TkoyEeXBqaW5zeH+GjI+NhXptZ2duc3t/ho2Sko2FfHNsamlrbHN6g4qQko2Ge3JsaWlpbHJ6goqQkY2Ge3Jsa2lpam5zeYCIj5KNhntzb2xpam1xd3+HjpGOiIJ7d3NwcHN2eX6ChoeFgHp1cXBwcXN2eX2Bg4aDf3p1cnBwcXN1eHx/goOCf3t3dHJxcnN1d3p9gIGBf3t4dXNycnN1d3p8foCAf3x5dnRzc3N1d3l8fn9/fnx5dnV0dHR1d3l7fX5+fXt5dnV0dHV2eHp8fX19fHp4dnV1dXZ3eXt8fX18e3l3dnV1dnZ4eXt8fX18e3l4d3Z2dnZ4eXt8fHx7enl4d3Z2dnd4eXp7fHx7enl4d3d3d3d4eXp7e3t6eXl4d3d3d3h5enp7e3p6eXl4eHd3d3h5enp6enp5eXl4eHh4eHl5enp6enl5eXl4eHh4eXl5enp6eXl5eXl4eHh4");
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore autoplay errors
    
    // Show toast notification
    toast.info(
      `New message from ${userName}`,
      {
        description: message.message.length > 50 
          ? message.message.substring(0, 50) + "..." 
          : message.message,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => setSelectedConvId(message.conversation_id),
        },
      }
    );
  }, []);

  const { 
    conversations, 
    loading, 
    newMessageCount,
    getConversationMessages, 
    sendAgentReply, 
    closeConversation,
    clearNewMessageCount 
  } = useAdminChats(handleNewMessage);

  const loadMessages = async (convId: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await getConversationMessages(convId);
      setMessages(msgs);
      clearNewMessageCount();
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConvId || !user) return;

    try {
      await sendAgentReply(selectedConvId, replyText, user.id);
      setReplyText("");
      await loadMessages(selectedConvId);
      toast.success("Reply sent");
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  const handleCloseConversation = async (convId: string) => {
    try {
      await closeConversation(convId);
      if (selectedConvId === convId) {
        setSelectedConvId(null);
        setMessages([]);
      }
      toast.success("Conversation closed");
    } catch (error) {
      toast.error("Failed to close conversation");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Open</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-muted text-muted-foreground"><X className="w-3 h-3 mr-1" /> Closed</Badge>;
      default:
        return null;
    }
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case "user":
        return <User className="w-4 h-4" />;
      case "agent":
        return <Headphones className="w-4 h-4" />;
      case "bot":
        return <Bot className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Chat Support</h1>
          <p className="text-muted-foreground">Manage customer chat conversations</p>
        </div>
        <div className="flex items-center gap-3">
          {newMessageCount > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">
              <Bell className="w-4 h-4 mr-2" />
              {newMessageCount} New
            </Badge>
          )}
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <MessageSquare className="w-4 h-4 mr-2" />
            {conversations.filter(c => c.status === "pending").length} Pending
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <ScrollArea className="h-[calc(100%-60px)]">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConvId === conv.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedConvId(conv.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{conv.user_email}</p>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conv.last_message}
                        </p>
                      </div>
                      {getStatusBadge(conv.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(conv.updated_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat View */}
        <div className="lg:col-span-2 border border-border rounded-lg overflow-hidden flex flex-col">
          {selectedConvId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {conversations.find(c => c.id === selectedConvId)?.user_email}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {getStatusBadge(conversations.find(c => c.id === selectedConvId)?.status || "")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCloseConversation(selectedConvId)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-1" /> Close Chat
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="text-center text-muted-foreground">Loading messages...</div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${
                          msg.sender_type === "agent" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.sender_type !== "agent" && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.sender_type === "bot" ? "bg-muted" : "bg-primary/10"
                          }`}>
                            {getSenderIcon(msg.sender_type)}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                            msg.sender_type === "agent"
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : msg.sender_type === "bot"
                              ? "bg-muted rounded-bl-sm"
                              : "bg-accent/20 rounded-bl-sm"
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </p>
                        </div>
                        {msg.sender_type === "agent" && (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            {getSenderIcon(msg.sender_type)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Reply Input */}
              <div className="p-4 border-t border-border">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendReply();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!replyText.trim()}>
                    <Send className="w-4 h-4 mr-2" /> Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
