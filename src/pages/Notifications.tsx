import { motion } from "framer-motion";
import { Bell, Gift, Tag, MessageSquare, Sparkles, Trash2, ShoppingBag, CreditCard, Package, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import { format } from "date-fns";

const getIcon = (type: string | null) => {
  switch (type) {
    case "coupon":
    case "new_coupon":
      return Tag;
    case "deal":
    case "sale":
      return Gift;
    case "reply":
    case "message":
      return MessageSquare;
    case "order":
    case "order_placed":
    case "order_shipped":
    case "order_delivered":
      return ShoppingBag;
    case "refund":
    case "refund_approved":
    case "refund_completed":
      return CreditCard;
    case "product":
    case "new_product":
      return Package;
    case "warning":
    case "alert":
      return AlertCircle;
    default:
      return Sparkles;
  }
};

const getColor = (type: string | null) => {
  switch (type) {
    case "coupon":
    case "new_coupon":
      return "text-green-500 bg-green-500/10";
    case "deal":
    case "sale":
      return "text-orange-500 bg-orange-500/10";
    case "reply":
    case "message":
      return "text-blue-500 bg-blue-500/10";
    case "order":
    case "order_placed":
    case "order_shipped":
    case "order_delivered":
      return "text-indigo-500 bg-indigo-500/10";
    case "refund":
    case "refund_approved":
    case "refund_completed":
      return "text-purple-500 bg-purple-500/10";
    case "product":
    case "new_product":
      return "text-pink-500 bg-pink-500/10";
    case "warning":
    case "alert":
      return "text-yellow-500 bg-yellow-500/10";
    default:
      return "text-primary bg-primary/10";
  }
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useUserNotifications();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
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

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    You'll receive coupon codes, deals, and order updates here.
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
                      onClick={() => handleNotificationClick(notification)}
                      className={`glass-card p-4 cursor-pointer transition-all hover:bg-muted/50 group ${
                        !notification.is_read ? "border-l-4 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-semibold ${
                                !notification.is_read
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                              {format(new Date(notification.created_at), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          {notification.link && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                              <ExternalLink className="w-3 h-3" />
                              <span>View details</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 hover:text-destructive shrink-0"
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
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 rounded-xl bg-accent/5 border border-accent/20"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Notifications Enabled</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll receive exclusive coupon codes, deals, order updates, and
                  replies to your messages here.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
