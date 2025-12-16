import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Package,
  Calendar,
  Bell,
  Settings,
  TrendingUp,
  ChevronRight,
  LogOut,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  Factory,
  Truck,
  ClipboardList,
  Box,
  BarChart3,
  Target,
  Users,
  Wrench,
  Video,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { TaskManagementView } from "@/components/tasks/TaskManagementView";

const ProductionDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { orders, meetings, notices, notifications, unreadCount, isLoading, markAsRead, refetch } = useRealtimeNotifications();

  const name = searchParams.get("name") || "Production Head";
  const title = searchParams.get("title") || "Production Head and Manager";
  const department = searchParams.get("department") || "Production & Operations";

  const stats = [
    { label: "Products in Queue", value: orders.filter(o => o.order_status === "pending").length.toString(), icon: Box, color: "text-blue-500" },
    { label: "Being Manufactured", value: orders.filter(o => o.order_status === "processing").length.toString(), icon: Factory, color: "text-yellow-500" },
    { label: "Ready to Ship", value: orders.filter(o => o.order_status === "shipped").length.toString(), icon: Truck, color: "text-green-500" },
    { label: "Completed Today", value: orders.filter(o => o.order_status === "delivered").length.toString(), icon: CheckCircle, color: "text-emerald-500" },
  ];

  const productionQueue = orders.filter(o => o.order_status === "pending" || o.order_status === "processing").slice(0, 5);

  const qualityMetrics = [
    { label: "Quality Pass Rate", value: 98, target: 95 },
    { label: "On-Time Delivery", value: 94, target: 90 },
    { label: "Customer Satisfaction", value: 96, target: 95 },
    { label: "Defect Rate", value: 2, target: 5, inverse: true },
  ];

  const handleSignOut = () => {
    navigate("/");
    toast.success("Signed out successfully");
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order status");
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      refetch(); // Refresh data after update
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{name}</h1>
              <p className="text-sm text-muted-foreground">{title} • {department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveTab("notifications")}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 rounded-2xl p-6 mb-8 border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Production Dashboard 🏭</h2>
              <p className="text-muted-foreground">Monitor production queue, quality metrics, and order fulfillment</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-500">
                <Factory className="w-3 h-3" />
                Production Head
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:border-orange-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-orange-500" />
                  My Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskManagementView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Production Queue Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-orange-500" />
                    Production Queue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : productionQueue.length === 0 ? (
                    <p className="text-muted-foreground">No orders in queue</p>
                  ) : (
                    productionQueue.map((order) => (
                      <div key={order.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          order.order_status === "processing" ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {order.order_status === "processing" ? <Factory className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{(order.items as any[])?.length || 0} items</p>
                        </div>
                        <Badge variant={order.order_status === "processing" ? "secondary" : "outline"} className="capitalize">
                          {order.order_status}
                        </Badge>
                      </div>
                    ))
                  )}
                  <Button variant="ghost" className="w-full gap-1" onClick={() => setActiveTab("queue")}>
                    View Full Queue <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qualityMetrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{metric.label}</span>
                        <span className={`text-sm font-medium ${
                          metric.inverse 
                            ? (metric.value <= metric.target ? "text-green-500" : "text-red-500")
                            : (metric.value >= metric.target ? "text-green-500" : "text-red-500")
                        }`}>
                          {metric.value}%
                        </span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Production Queue</span>
                  <Badge variant="outline">{orders.length} Orders</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        order.order_status === "delivered" ? "bg-green-500/10 text-green-500" :
                        order.order_status === "shipped" ? "bg-blue-500/10 text-blue-500" :
                        order.order_status === "processing" ? "bg-yellow-500/10 text-yellow-500" : "bg-muted text-muted-foreground"
                      }`}>
                        {order.order_status === "delivered" ? <CheckCircle className="w-5 h-5" /> : 
                         order.order_status === "shipped" ? <Truck className="w-5 h-5" /> :
                         order.order_status === "processing" ? <Factory className="w-5 h-5" /> : <Box className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(order.items as any[])?.length || 0} items • ₹{order.total_amount}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.order_status === "pending" && (
                          <Button size="sm" onClick={() => updateOrderStatus(order.id, "processing")}>
                            Start Production
                          </Button>
                        )}
                        {order.order_status === "processing" && (
                          <Button size="sm" onClick={() => updateOrderStatus(order.id, "shipped")}>
                            Mark Ready
                          </Button>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {order.order_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-500" />
                  Upcoming Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {meetings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No scheduled meetings</p>
                ) : (
                  <div className="space-y-3">
                    {meetings.map((meeting) => (
                      <div key={meeting.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Video className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(meeting.meeting_date).toLocaleString()} • {meeting.duration_minutes} mins
                          </p>
                        </div>
                        {meeting.meeting_link && (
                          <Button size="sm" onClick={() => window.open(meeting.meeting_link, '_blank')}>
                            Join
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-yellow-500" />
                  Company Notices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No active notices</p>
                ) : (
                  <div className="space-y-3">
                    {notices.map((notice) => (
                      <div key={notice.id} className={`p-4 rounded-xl border ${
                        notice.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                        notice.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-muted/50 border-border'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{notice.title}</h3>
                          <Badge variant={notice.priority === 'high' ? 'destructive' : notice.priority === 'medium' ? 'secondary' : 'outline'}>
                            {notice.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notice.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  Real-time Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No new notifications</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                          notification.read ? 'bg-muted/30' : 'bg-orange-500/10 border border-orange-500/30'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.type === 'order' ? 'bg-green-500/10 text-green-500' :
                          notification.type === 'task' ? 'bg-blue-500/10 text-blue-500' :
                          notification.type === 'meeting' ? 'bg-purple-500/10 text-purple-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {notification.type === 'order' ? <Package className="w-5 h-5" /> :
                           notification.type === 'task' ? <ClipboardList className="w-5 h-5" /> :
                           notification.type === 'meeting' ? <Video className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProductionDashboard;
