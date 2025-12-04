import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MailOpen, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useContactMessages, useMarkMessageRead } from "@/hooks/useSiteData";
import { format } from "date-fns";

export default function MessagesManager() {
  const { data: messages, isLoading } = useContactMessages();
  const markRead = useMarkMessageRead();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const handleOpenMessage = async (message: any) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await markRead.mutateAsync(message.id);
    }
  };

  const unreadCount = messages?.filter(m => !m.is_read).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Contact form submissions • {unreadCount} unread
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : messages?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
          <p className="text-muted-foreground">
            Messages from your contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages?.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleOpenMessage(message)}
              className={`glass-card p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                !message.is_read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${message.is_read ? 'bg-muted' : 'bg-primary/20'}`}>
                  {message.is_read ? (
                    <MailOpen className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Mail className="w-5 h-5 text-primary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate ${!message.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {message.name}
                    </h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(message.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{message.email}</p>
                  {message.subject && (
                    <p className={`text-sm mt-1 ${!message.is_read ? 'font-medium' : ''}`}>
                      {message.subject}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {message.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Message from {selectedMessage.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedMessage.created_at), 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>

                {selectedMessage.subject && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium">{selectedMessage.subject}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="glass-card p-4 bg-muted/30 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `mailto:${selectedMessage.email}`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
