import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Bot, Loader2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLiveChat } from "@/hooks/useLiveChat";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export function LiveChat() {
  const { isOpen, closeChat } = useLiveChat();
  const { user } = useAuth();
  const { conversationId, messages, loading, initConversation, sendMessage } = useChatMessages();
  const [inputValue, setInputValue] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isOpen && user && !initialized) {
      initConversation().then(() => setInitialized(true));
    }
  }, [isOpen, user, initialized]);

  useEffect(() => {
    if (!isOpen) {
      setInitialized(false);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId) return;
    await sendMessage(inputValue);
    setInputValue("");
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">ASIREX Support</h3>
                <p className="text-xs opacity-80">We typically reply in minutes</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={closeChat}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Start a conversation...</p>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.sender_type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender_type !== "user" && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender_type === "agent" ? "bg-primary/20" : "bg-muted"
                    }`}>
                      {getSenderIcon(message.sender_type)}
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      message.sender_type === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : message.sender_type === "agent"
                        ? "bg-accent/30 rounded-bl-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p>{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(message.created_at), "h:mm a")}
                    </p>
                  </div>
                  {message.sender_type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      {getSenderIcon(message.sender_type)}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={loading || !conversationId}
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || loading || !conversationId}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
