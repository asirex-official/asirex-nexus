import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ListTodo,
  Calendar,
  Bell,
  Clock,
  CheckCircle,
  DollarSign,
  LogOut,
  Briefcase,
  Star,
  CalendarCheck,
  Timer,
  TrendingUp,
  Award,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Progress } from "@/components/ui/progress";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  description: string | null;
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { meetings, notices, notifications, unreadCount, markAsRead } = useRealtimeNotifications();

  const name = searchParams.get("name") || "Employee";
  const title = searchParams.get("title") || "Team Member";
  const department = searchParams.get("department") || "Department";

  // Mock attendance data
  const attendanceData = {
    presentDays: 22,
    totalDays: 25,
    percentage: 88,
    lastCheckIn: "9:05 AM",
    hoursToday: "6h 32m",
  };

  // Mock salary info
  const salaryInfo = {
    currentMonth: "₹25,000",
    bonus: "₹2,500",
    nextPayment: "Jan 31, 2025",
    status: "On Track",
    deductions: "₹2,000",
    netPay: "₹25,500",
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", taskId);

      if (error) throw error;
      toast.success("Task marked as completed!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const stats = [
    { label: "Pending Tasks", value: tasks.filter(t => t.status === "pending").length, icon: Clock, color: "text-orange-500" },
    { label: "Completed", value: tasks.filter(t => t.status === "completed").length, icon: CheckCircle, color: "text-green-500" },
    { label: "Attendance", value: `${attendanceData.percentage}%`, icon: CalendarCheck, color: "text-blue-500" },
    { label: "Performance", value: "92%", icon: TrendingUp, color: "text-purple-500" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{name}</h1>
              <p className="text-sm text-muted-foreground">{title} • {department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="salary">Salary</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Today's Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Today's Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-blue-500" />
                      <span>Hours Worked</span>
                    </div>
                    <span className="font-bold">{attendanceData.hoursToday}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span>Check-in Time</span>
                    </div>
                    <span className="font-bold">{attendanceData.lastCheckIn}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-orange-500" />
                      <span>Tasks Due Today</span>
                    </div>
                    <span className="font-bold">{pendingTasks.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("tasks")}>
                    <ListTodo className="w-6 h-6 text-blue-500" />
                    <span className="text-xs">View Tasks</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("attendance")}>
                    <CalendarCheck className="w-6 h-6 text-green-500" />
                    <span className="text-xs">Attendance</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("salary")}>
                    <DollarSign className="w-6 h-6 text-purple-500" />
                    <span className="text-xs">Salary Info</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/notifications")}>
                    <Bell className="w-6 h-6 text-orange-500" />
                    <span className="text-xs">Notifications</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Notices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  Company Notices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No notices</p>
                ) : (
                  notices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className={`p-3 rounded-lg border ${
                      notice.priority === "high" ? "border-red-500/30 bg-red-500/10" :
                      "border-border bg-muted/50"
                    }`}>
                      <div className="flex items-center gap-2">
                        {notice.priority === "high" && <AlertCircle className="w-4 h-4 text-red-500" />}
                        <p className="font-medium">{notice.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notice.content?.slice(0, 80)}...</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pending Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pending Tasks ({pendingTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pending tasks</p>
                  ) : (
                    pendingTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === "high" ? "bg-red-500" :
                          task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.due_date && (
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleCompleteTask(task.id)}>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Completed Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Completed ({completedTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No completed tasks</p>
                  ) : (
                    completedTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <p className="text-sm">{task.title}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-500" />
                  Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Monthly Attendance</p>
                  <p className="text-5xl font-bold text-primary">{attendanceData.percentage}%</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {attendanceData.presentDays} / {attendanceData.totalDays} working days
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress this month</span>
                    <span className="font-medium">{attendanceData.percentage}%</span>
                  </div>
                  <Progress value={attendanceData.percentage} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-500">{attendanceData.presentDays}</p>
                    <p className="text-sm text-muted-foreground">Present Days</p>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-500">{attendanceData.totalDays - attendanceData.presentDays}</p>
                    <p className="text-sm text-muted-foreground">Absent Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Salary Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Net Salary (This Month)</p>
                  <p className="text-4xl font-bold text-green-500">{salaryInfo.netPay}</p>
                  <Badge className="mt-2" variant="outline">{salaryInfo.status}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Base Salary</span>
                    <span className="font-medium">{salaryInfo.currentMonth}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <span className="text-muted-foreground">Bonus</span>
                    <span className="font-medium text-green-500">+{salaryInfo.bonus}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                    <span className="text-muted-foreground">Deductions</span>
                    <span className="font-medium text-red-500">-{salaryInfo.deductions}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="font-medium">Net Pay</span>
                    <span className="font-bold text-lg">{salaryInfo.netPay}</span>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Next Payment Date</span>
                  </div>
                  <p className="font-medium">{salaryInfo.nextPayment}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
