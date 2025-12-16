import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Code,
  Package,
  FolderKanban,
  Calendar,
  Bell,
  Settings,
  Edit3,
  TrendingUp,
  FileText,
  Globe,
  Palette,
  Layers,
  ChevronRight,
  LogOut,
  Terminal,
  Zap,
  Bug,
  Rocket,
  Video,
  Megaphone,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { meetings, notices, notifications, unreadCount, markAsRead, tasks } = useRealtimeNotifications();

  const quickActions = [
    { label: "Edit Products", icon: Package, color: "bg-blue-500/10 text-blue-500", action: () => navigate("/admin/products") },
    { label: "Edit Projects", icon: FolderKanban, color: "bg-purple-500/10 text-purple-500", action: () => navigate("/admin/projects") },
    { label: "Edit Events", icon: Calendar, color: "bg-orange-500/10 text-orange-500", action: () => navigate("/admin/events") },
    { label: "Site Content", icon: FileText, color: "bg-cyan-500/10 text-cyan-500", action: () => navigate("/admin/content") },
    { label: "Design System", icon: Palette, color: "bg-pink-500/10 text-pink-500", action: () => toast.info("Design System - Coming Soon") },
    { label: "Components", icon: Layers, color: "bg-green-500/10 text-green-500", action: () => toast.info("Component Library - Coming Soon") },
  ];

  const stats = [
    { label: "Pages Updated", value: "24", icon: FileText, trend: "This week" },
    { label: "Features Added", value: "8", icon: Zap, trend: "This month" },
    { label: "Bugs Fixed", value: "15", icon: Bug, trend: "This month" },
    { label: "Deployments", value: "12", icon: Rocket, trend: "This month" },
  ];

  const recentTasks = [
    { id: 1, title: "Update homepage hero section", status: "completed", priority: "high" },
    { id: 2, title: "Add new product category", status: "in-progress", priority: "medium" },
    { id: 3, title: "Fix mobile navigation", status: "pending", priority: "high" },
    { id: 4, title: "Optimize images for performance", status: "pending", priority: "low" },
  ];

  const handleSignOut = () => {
    navigate("/");
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Website Developer</h1>
              <p className="text-sm text-muted-foreground">Developer • Software Engineering</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveTab("notifications")}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground">
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
          className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl p-6 mb-8 border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome, Developer! 💻</h2>
              <p className="text-muted-foreground">Enhance and manage the ASIREX website. You have editing access to all content.</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Terminal className="w-3 h-3" />
                Developer
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                Site Editor
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
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-8 h-8 text-cyan-500" />
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={action.action}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-transform`}
                >
                  <action.icon className="w-6 h-6" />
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Updates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Deployed new features</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Edit3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Updated product pages</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Bug className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Fixed navigation bug</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* From Leadership */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">From Leadership</CardTitle>
                  <Badge variant="outline">CEO</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm font-medium mb-2">Priority: Update Aqua Purifier Page</p>
                    <p className="text-xs text-muted-foreground">Add new technical specifications and update progress percentage to reflect current development status.</p>
                    <p className="text-xs text-muted-foreground mt-2">— Kapeesh Sorout, CEO</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Add new event for Feb 2026</p>
                    <p className="text-xs text-muted-foreground">Create event page for ASIREX Tech Summit.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No tasks assigned</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === "completed" ? "bg-green-500" :
                          task.status === "in_progress" ? "bg-yellow-500" : "bg-muted-foreground"
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">{task.status?.replace("_", " ")}</Badge>
                            <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"} className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                  <Bell className="w-5 h-5 text-cyan-500" />
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
                          notification.read ? 'bg-muted/30' : 'bg-cyan-500/10 border border-cyan-500/30'
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
                          <div className="w-2 h-2 rounded-full bg-cyan-500" />
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

export default DeveloperDashboard;
