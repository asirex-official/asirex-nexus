import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Video,
  Calendar,
  Bell,
  Settings,
  TrendingUp,
  FileText,
  ChevronRight,
  LogOut,
  Briefcase,
  Clock,
  DollarSign,
  Award,
  Users,
  MessageSquare,
  Package,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const CorePillarDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  const name = searchParams.get("name") || "Core Member";
  const title = searchParams.get("title") || "Core Pillar";
  const department = searchParams.get("department") || "Department";

  const quickActions = [
    { label: "Join Meeting", icon: Video, color: "bg-blue-500/10 text-blue-500", action: () => toast.info("Join Meeting - Check your email for link") },
    { label: "Start Meeting", icon: Video, color: "bg-green-500/10 text-green-500", action: () => toast.info("Start Meeting - Coming Soon") },
    { label: "Today's Work", icon: Briefcase, color: "bg-purple-500/10 text-purple-500", action: () => setActiveTab("tasks") },
    { label: "Upcoming Events", icon: Calendar, color: "bg-orange-500/10 text-orange-500", action: () => setActiveTab("events") },
  ];

  const stats = [
    { label: "Tasks Completed", value: "12", icon: CheckCircle, trend: "This week" },
    { label: "Pending Tasks", value: "3", icon: Clock, trend: "Due soon" },
    { label: "Meetings Today", value: "2", icon: Video, trend: "Next: 3 PM" },
    { label: "Performance", value: "95%", icon: Star, trend: "Excellent" },
  ];

  const todayTasks = [
    { id: 1, title: "Review product packaging", status: "completed", time: "9:00 AM" },
    { id: 2, title: "Quality check for new batch", status: "in-progress", time: "11:00 AM" },
    { id: 3, title: "Update inventory records", status: "pending", time: "2:00 PM" },
    { id: 4, title: "Team sync meeting", status: "pending", time: "4:00 PM" },
  ];

  const upcomingEvents = [
    { id: 1, title: "ASIREX Tech Summit 2026", date: "Feb 4, 2026", location: "Noida" },
    { id: 2, title: "Product Launch Event", date: "Feb 17, 2026", location: "Delhi" },
    { id: 3, title: "Team Building Workshop", date: "Feb 20, 2026", location: "Office" },
  ];

  const fromLeadership = [
    { id: 1, from: "CEO", title: "New Order Alert", message: "3 new orders received today. Priority processing required.", time: "2 hours ago", priority: "high" },
    { id: 2, from: "CEO", title: "Meeting Tomorrow", message: "Team meeting at 10 AM to discuss Q1 targets.", time: "Yesterday", priority: "medium" },
    { id: 3, from: "Developer", title: "Website Updated", message: "New product pages are live. Please review and confirm.", time: "2 days ago", priority: "low" },
  ];

  const salaryInfo = {
    currentMonth: "₹25,000",
    bonus: "₹5,000",
    nextPayment: "Jan 31, 2025",
    status: "On Track",
  };

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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">{name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{name}</h1>
              <p className="text-sm text-muted-foreground">{title} • {department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">5</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
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
          className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-cyan-500/10 rounded-2xl p-6 mb-8 border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {name.split(" ")[0]}! 👋</h2>
              <p className="text-muted-foreground">Here's your daily overview. Stay productive and keep up the great work!</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Award className="w-3 h-3" />
                Core Pillar
              </Badge>
              <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30">
                <CheckCircle className="w-3 h-3" />
                Active
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.action}
              className={`flex items-center gap-3 p-4 rounded-xl ${action.color} hover:scale-105 transition-transform`}
            >
              <action.icon className="w-6 h-6" />
              <span className="font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>

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
                    <stat.icon className="w-8 h-8 text-primary" />
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-green-500 mt-1">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="info">My Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* From Leadership */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    From Leadership
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fromLeadership.map((item) => (
                    <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{item.from}</Badge>
                          <span className="text-sm font-medium">{item.title}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          item.priority === "high" ? "bg-red-500" :
                          item.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                        }`} />
                      </div>
                      <p className="text-xs text-muted-foreground">{item.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{item.time}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todayTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        task.status === "completed" ? "bg-green-500/10 text-green-500" :
                        task.status === "in-progress" ? "bg-yellow-500/10 text-yellow-500" : "bg-muted text-muted-foreground"
                      }`}>
                        {task.status === "completed" ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.time}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full gap-1" onClick={() => setActiveTab("tasks")}>
                    View All Tasks <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Today's Work</span>
                  <Badge variant="outline">{todayTasks.filter(t => t.status === "completed").length}/{todayTasks.length} Done</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        task.status === "completed" ? "bg-green-500/10 text-green-500" :
                        task.status === "in-progress" ? "bg-yellow-500/10 text-yellow-500" : "bg-muted text-muted-foreground"
                      }`}>
                        {task.status === "completed" ? <CheckCircle className="w-5 h-5" /> : 
                         task.status === "in-progress" ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.time}</p>
                      </div>
                      <Badge variant={
                        task.status === "completed" ? "default" :
                        task.status === "in-progress" ? "secondary" : "outline"
                      } className="capitalize">
                        {task.status.replace("-", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.date} • {event.location}</p>
                      </div>
                      <Button variant="outline" size="sm">Details</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Salary & Bonus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Salary & Bonus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm text-muted-foreground">Current Month Salary</span>
                    <span className="font-bold text-green-500">{salaryInfo.currentMonth}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                    <span className="text-sm text-muted-foreground">Performance Bonus</span>
                    <span className="font-bold text-yellow-500">{salaryInfo.bonus}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Next Payment</span>
                    <span className="font-medium">{salaryInfo.nextPayment}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline" className="text-green-500 border-green-500/30">{salaryInfo.status}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Performance & Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <span className="text-sm text-muted-foreground">Overall Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Tasks Completed</span>
                    <span className="font-medium">156 / 160</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Attendance</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm text-muted-foreground">Next Promotion Review</span>
                    <span className="font-medium text-green-500">Mar 2025</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CorePillarDashboard;
