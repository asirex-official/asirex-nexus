import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Gift, Tag, MessageSquare, Sparkles, Trash2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface Notification {
  id: string;
  type: "coupon" | "deal" | "reply" | "announcement";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// Sample notifications - in production these would come from database
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "coupon",
    title: "Special Discount!",
    message: "Use code ASIREX10 for 10% off your next order!",
    date: "2024-12-13",
    read: false
  },
  {
    id: "2",
    type: "deal",
    title: "Flash Sale",
    message: "Limited time offer: Get 25% off on all spy earpieces!",
    date: "2024-12-12",
    read: false
  },
  {
    id: "3",
    type: "announcement",
    title: "Welcome to ASIREX Family!",
    message: "Thank you for joining us. Explore our innovative products and projects.",
    date: "2024-12-10",
    read: true
  }
];

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "coupon": return Tag;
    case "deal": return Gift;
    case "reply": return MessageSquare;
    case "announcement": return Sparkles;
  }
};

const getColor = (type: Notification["type"]) => {
  switch (type) {
    case "coupon": return "text-green-500 bg-green-500/10";
    case "deal": return "text-orange-500 bg-orange-500/10";
    case "reply": return "text-blue-500 bg-blue-500/10";
    case "announcement": return "text-primary bg-primary/10";
  }
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold">Notifications</h1>
                  <p className="text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
          </motion.div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  You'll receive coupon codes, deals, and message replies here.
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const Icon = getIcon(notification.type);
                const colorClass = getColor(notification.type);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => markAsRead(notification.id)}
                    className={`glass-card p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                      !notification.read ? 'border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 rounded-xl bg-accent/5 border border-accent/20"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">🔓 Notifications Unlocked!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  As a logged-in member, you'll receive exclusive coupon codes, deals, 
                  new product announcements, and replies to your messages.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
