import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Bot, Loader2, Headphones, Paperclip, Image, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLiveChat } from "@/hooks/useLiveChat";
import { useChatMessages, ChatAttachment } from "@/hooks/useChatMessages";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export function LiveChat() {
  const { isOpen, closeChat, initialMessage, clearInitialMessage } = useLiveChat();
  const { user } = useAuth();
  const { conversationId, messages, loading, uploading, initConversation, sendMessage, uploadFiles } = useChatMessages();
  const [inputValue, setInputValue] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [sentInitialMessage, setSentInitialMessage] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user && !initialized) {
      initConversation().then(() => setInitialized(true));
    }
  }, [isOpen, user, initialized]);

  // Send initial message if provided
  useEffect(() => {
    if (initialized && conversationId && initialMessage && !sentInitialMessage) {
      sendMessage(initialMessage).then(() => {
        clearInitialMessage();
        setSentInitialMessage(true);
      });
    }
  }, [initialized, conversationId, initialMessage, sentInitialMessage]);

  useEffect(() => {
    if (!isOpen) {
      setInitialized(false);
      setSentInitialMessage(false);
      setPendingFiles([]);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setPendingFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && pendingFiles.length === 0) || !conversationId) return;
    
    let attachments: ChatAttachment[] | undefined;
    
    if (pendingFiles.length > 0) {
      attachments = await uploadFiles(pendingFiles);
      setPendingFiles([]);
    }
    
    await sendMessage(inputValue, attachments);
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderAttachments = (attachments: ChatAttachment[]) => {
    return (
      <div className="mt-2 space-y-2">
        {attachments.map((attachment, idx) => (
          <div key={idx} className="rounded-lg overflow-hidden">
            {attachment.type.startsWith('image/') ? (
              <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                <img 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="max-w-full max-h-48 rounded-lg object-cover hover:opacity-90 transition-opacity"
                />
              </a>
            ) : (
              <a 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-background/50 rounded-lg hover:bg-background/70 transition-colors"
              >
                {getFileIcon(attachment.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{attachment.name}</p>
                  <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                </div>
              </a>
            )}
          </div>
        ))}
      </div>
    );
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
                    {message.message && <p>{message.message}</p>}
                    {message.attachments && message.attachments.length > 0 && 
                      renderAttachments(message.attachments)
                    }
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

          {/* Pending Files Preview */}
          {pendingFiles.length > 0 && (
            <div className="px-4 py-2 border-t border-border bg-muted/30">
              <div className="flex flex-wrap gap-2">
                {pendingFiles.map((file, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-1 bg-background px-2 py-1 rounded-lg text-xs"
                  >
                    {getFileIcon(file.type)}
                    <span className="max-w-[80px] truncate">{file.name}</span>
                    <button 
                      onClick={() => removeFile(idx)}
                      className="text-destructive hover:text-destructive/80 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || !conversationId || uploading}
                className="flex-shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={loading || !conversationId || uploading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={(!inputValue.trim() && pendingFiles.length === 0) || loading || !conversationId || uploading}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}