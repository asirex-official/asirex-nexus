import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Users,
  FolderKanban,
  ListTodo,
  Calendar,
  Bell,
  Video,
  Clock,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  LogOut,
  Briefcase,
  Target,
  BarChart3,
  UserPlus,
  FileText,
  Award,
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  profile_image: string | null;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
}

interface Project {
  id: string;
  title: string;
  status: string;
  progress_percentage: number;
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { meetings, notices, notifications, unreadCount, markAsRead } = useRealtimeNotifications();

  const name = searchParams.get("name") || "Manager";
  const title = searchParams.get("title") || "Team Manager";
  const department = searchParams.get("department") || "Department";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [teamRes, tasksRes, projectsRes] = await Promise.all([
        supabase.from("team_members").select("*").eq("status", "active").limit(10),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("projects").select("*").order("display_order", { ascending: true }),
      ]);

      if (teamRes.data) setTeamMembers(teamRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: "Team Members", value: teamMembers.length, icon: Users, color: "text-blue-500" },
    { label: "Active Projects", value: projects.filter(p => p.status !== "completed").length, icon: FolderKanban, color: "text-purple-500" },
    { label: "Pending Tasks", value: tasks.filter(t => t.status === "pending").length, icon: ListTodo, color: "text-orange-500" },
    { label: "Completed", value: tasks.filter(t => t.status === "completed").length, icon: CheckCircle, color: "text-green-500" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{name}</h1>
              <p className="text-sm text-muted-foreground">{title} • {department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
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
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("tasks")}>
                    <ListTodo className="w-6 h-6 text-blue-500" />
                    <span className="text-xs">Manage Tasks</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("team")}>
                    <Users className="w-6 h-6 text-green-500" />
                    <span className="text-xs">View Team</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => toast.info("Start meeting - Coming soon")}>
                    <Video className="w-6 h-6 text-purple-500" />
                    <span className="text-xs">Start Meeting</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("projects")}>
                    <FolderKanban className="w-6 h-6 text-orange-500" />
                    <span className="text-xs">Projects</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Upcoming Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {meetings.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No upcoming meetings</p>
                  ) : (
                    meetings.slice(0, 3).map((meeting) => (
                      <div key={meeting.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Video className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{meeting.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(meeting.meeting_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Notices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  Recent Notices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className={`p-3 rounded-lg border ${
                    notice.priority === "high" ? "border-red-500/30 bg-red-500/10" :
                    notice.priority === "medium" ? "border-yellow-500/30 bg-yellow-500/10" :
                    "border-border bg-muted/50"
                  }`}>
                    <p className="font-medium">{notice.title}</p>
                    <p className="text-sm text-muted-foreground">{notice.content?.slice(0, 100)}...</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Team Members ({teamMembers.length})</span>
                  <Button variant="outline" size="sm" onClick={() => navigate("/team-directory")}>
                    View Directory
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {member.profile_image ? (
                          <img src={member.profile_image} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <span className="font-bold text-primary">{member.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
                      </div>
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === "high" ? "bg-red-500" :
                      task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize">{task.status?.replace("_", " ")}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {project.title}
                      <Badge variant="outline">{project.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={project.progress_percentage || 0} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
