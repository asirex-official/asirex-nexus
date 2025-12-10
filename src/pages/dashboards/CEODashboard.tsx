import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  FolderKanban,
  Calendar,
  Bell,
  MessageSquare,
  Settings,
  Edit3,
  UserPlus,
  UserMinus,
  Shield,
  TrendingUp,
  Briefcase,
  Megaphone,
  FileText,
  Video,
  ChevronRight,
  LogOut,
  Crown,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  joinDate: string;
}

const CEODashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const teamMembers: TeamMember[] = [
    {
      id: "ASX-2025-001",
      name: "Vaibhav Ghatwal",
      role: "Production Head and Manager",
      department: "Production & Operations",
      status: "active",
      joinDate: "2025-01-15",
    },
  ];

  const quickActions = [
    { label: "Add Team Member", icon: UserPlus, color: "bg-green-500/10 text-green-500", action: () => toast.info("Add Team Member - Coming Soon") },
    { label: "Fire Team Member", icon: UserMinus, color: "bg-red-500/10 text-red-500", action: () => toast.info("Remove Team Member - Coming Soon") },
    { label: "Publish Product", icon: Package, color: "bg-blue-500/10 text-blue-500", action: () => navigate("/admin/products") },
    { label: "Add Project", icon: FolderKanban, color: "bg-purple-500/10 text-purple-500", action: () => navigate("/admin/projects") },
    { label: "Create Event", icon: Calendar, color: "bg-orange-500/10 text-orange-500", action: () => navigate("/admin/events") },
    { label: "Post Notice", icon: Megaphone, color: "bg-yellow-500/10 text-yellow-500", action: () => toast.info("Post Notice - Coming Soon") },
    { label: "Edit Website", icon: Edit3, color: "bg-cyan-500/10 text-cyan-500", action: () => navigate("/admin/content") },
    { label: "Manage Roles", icon: Shield, color: "bg-pink-500/10 text-pink-500", action: () => toast.info("Role Management - Coming Soon") },
  ];

  const stats = [
    { label: "Team Members", value: "2", icon: Users, trend: "+1 this month" },
    { label: "Active Projects", value: "5", icon: FolderKanban, trend: "+2 new" },
    { label: "Products Listed", value: "12", icon: Package, trend: "3 pending" },
    { label: "Pending Orders", value: "8", icon: Briefcase, trend: "₹45,000" },
  ];

  const recentNotices = [
    { id: 1, title: "Team Meeting Tomorrow", date: "Today", priority: "high" },
    { id: 2, title: "New Product Launch Prep", date: "Yesterday", priority: "medium" },
    { id: 3, title: "Website Maintenance", date: "2 days ago", priority: "low" },
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kapeesh Sorout</h1>
              <p className="text-sm text-muted-foreground">CEO & Founder • Executive Leadership</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">3</span>
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
          className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-2xl p-6 mb-8 border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, Kapeesh! 👋</h2>
              <p className="text-muted-foreground">You have full control over ASIREX. Manage your team, content, and website.</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                Super Admin
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                Full Access
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

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New product added</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Vaibhav updated production status</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Event scheduled for Feb 2026</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notices Preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Notices</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentNotices.map((notice) => (
                    <div key={notice.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        notice.priority === "high" ? "bg-red-500" :
                        notice.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notice.title}</p>
                        <p className="text-xs text-muted-foreground">{notice.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team Management</CardTitle>
                <div className="flex gap-2">
                  <Button className="gap-2" onClick={() => toast.info("Add Team Member - Coming Soon")}>
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* CEO Card */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Kapeesh Sorout</h3>
                        <Badge className="bg-yellow-500/20 text-yellow-500">You</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">CEO & Founder • Executive Leadership</p>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500/30">Active</Badge>
                  </div>

                  {/* Team Members */}
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">{member.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
                        <p className="text-xs text-muted-foreground">ID: {member.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={member.status === "active" ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"}>
                          {member.status}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => toast.info("Edit Member - Coming Soon")}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => toast.info("Remove Member - Coming Soon")}>
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Vacant Positions */}
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-muted-foreground">4 Vacant Positions</h3>
                      <p className="text-sm text-muted-foreground">Core Members, Sales Lead, Engineering Lead, Website Admin</p>
                    </div>
                    <Button variant="outline" onClick={() => toast.info("Hire - Coming Soon")}>
                      Hire Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notices" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notices & Announcements</CardTitle>
                <Button className="gap-2" onClick={() => toast.info("Create Notice - Coming Soon")}>
                  <Megaphone className="w-4 h-4" />
                  Post Notice
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNotices.map((notice) => (
                    <div key={notice.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${
                        notice.priority === "high" ? "bg-red-500" :
                        notice.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{notice.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {notice.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notice.date}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/admin/products")}>
                <CardContent className="p-6 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">Products</h3>
                  <p className="text-sm text-muted-foreground">Manage shop products</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/admin/projects")}>
                <CardContent className="p-6 text-center">
                  <FolderKanban className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-1">Projects</h3>
                  <p className="text-sm text-muted-foreground">Manage future projects</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/admin/events")}>
                <CardContent className="p-6 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-orange-500" />
                  <h3 className="font-semibold mb-1">Events</h3>
                  <p className="text-sm text-muted-foreground">Manage events</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/admin/content")}>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold mb-1">Site Content</h3>
                  <p className="text-sm text-muted-foreground">Edit website text</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/admin/messages")}>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-cyan-500" />
                  <h3 className="font-semibold mb-1">Messages</h3>
                  <p className="text-sm text-muted-foreground">View contact messages</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/admin/orders")}>
                <CardContent className="p-6 text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-1">Orders</h3>
                  <p className="text-sm text-muted-foreground">Manage orders</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CEODashboard;
