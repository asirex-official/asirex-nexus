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
  DollarSign,
  Eye,
  RefreshCw,
  Send,
  Gift,
  Award,
  Star,
  Target,
  Rocket,
  PlusCircle,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Building,
  Banknote,
  PieChart,
  BarChart3,
  Activity,
  Layers,
  Palette,
  Code,
  Image,
  Link,
  Share2,
  Download,
  Upload,
  Printer,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Heart,
  ThumbsUp,
  Lock,
  Unlock,
  Key,
  Wrench,
  Cpu,
  Database,
  Server,
  Wifi,
  Battery,
  Monitor,
  Smartphone,
  Tablet,
  Headphones,
  Camera,
  Mic,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Home,
  Map,
  Navigation,
  Compass,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Percent,
  CreditCard,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  joinDate: string;
  salary: string;
  email: string;
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
      salary: "₹25,000/month",
      email: "Vaibhav.Phm@asirex.in",
    },
  ];

  // Primary Quick Actions
  const primaryActions = [
    { label: "Add Team Member", icon: UserPlus, color: "bg-green-500 hover:bg-green-600 text-white", action: () => toast.info("Add Team Member - Coming Soon") },
    { label: "Fire Team Member", icon: UserMinus, color: "bg-red-500 hover:bg-red-600 text-white", action: () => toast.info("Remove Team Member - Coming Soon") },
    { label: "Start Meeting", icon: Video, color: "bg-blue-500 hover:bg-blue-600 text-white", action: () => toast.info("Start Meeting - Coming Soon") },
    { label: "Post Notice", icon: Megaphone, color: "bg-yellow-500 hover:bg-yellow-600 text-white", action: () => toast.info("Post Notice - Coming Soon") },
  ];

  // Content Management Actions
  const contentActions = [
    { label: "Add Product", icon: Package, color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20", action: () => navigate("/admin/products") },
    { label: "Add Project", icon: FolderKanban, color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20", action: () => navigate("/admin/projects") },
    { label: "Add Event", icon: Calendar, color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20", action: () => navigate("/admin/events") },
    { label: "Add Job Posting", icon: Briefcase, color: "bg-green-500/10 text-green-500 hover:bg-green-500/20", action: () => toast.info("Add Job - Coming Soon") },
    { label: "Edit Site Content", icon: FileText, color: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20", action: () => navigate("/admin/content") },
    { label: "Manage Orders", icon: ShoppingCart, color: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20", action: () => navigate("/admin/orders") },
  ];

  // Team Management Actions
  const teamActions = [
    { label: "Change Role", icon: Shield, color: "bg-purple-500/10 text-purple-500", action: () => toast.info("Change Role - Coming Soon") },
    { label: "Give Promotion", icon: Award, color: "bg-yellow-500/10 text-yellow-500", action: () => toast.info("Promotion - Coming Soon") },
    { label: "Give Bonus", icon: Gift, color: "bg-green-500/10 text-green-500", action: () => toast.info("Bonus - Coming Soon") },
    { label: "Change Salary", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-500", action: () => toast.info("Salary Change - Coming Soon") },
    { label: "Assign Work", icon: Target, color: "bg-blue-500/10 text-blue-500", action: () => toast.info("Assign Work - Coming Soon") },
    { label: "View Performance", icon: BarChart3, color: "bg-cyan-500/10 text-cyan-500", action: () => toast.info("View Performance - Coming Soon") },
  ];

  // Website Control Actions
  const websiteActions = [
    { label: "Edit Homepage", icon: Home, color: "bg-primary/10 text-primary", action: () => toast.info("Edit Homepage - Coming Soon") },
    { label: "Edit About Page", icon: Building, color: "bg-blue-500/10 text-blue-500", action: () => toast.info("Edit About - Coming Soon") },
    { label: "Edit Shop", icon: ShoppingBag, color: "bg-green-500/10 text-green-500", action: () => navigate("/admin/products") },
    { label: "Edit Projects", icon: Layers, color: "bg-purple-500/10 text-purple-500", action: () => navigate("/admin/projects") },
    { label: "Edit Events", icon: Calendar, color: "bg-orange-500/10 text-orange-500", action: () => navigate("/admin/events") },
    { label: "Design System", icon: Palette, color: "bg-pink-500/10 text-pink-500", action: () => toast.info("Design System - Coming Soon") },
    { label: "View Analytics", icon: PieChart, color: "bg-cyan-500/10 text-cyan-500", action: () => toast.info("Analytics - Coming Soon") },
    { label: "SEO Settings", icon: Search, color: "bg-yellow-500/10 text-yellow-500", action: () => toast.info("SEO Settings - Coming Soon") },
  ];

  // Communication Actions
  const communicationActions = [
    { label: "Send Email", icon: Mail, color: "bg-blue-500/10 text-blue-500", action: () => toast.info("Send Email - Coming Soon") },
    { label: "Call Team", icon: Phone, color: "bg-green-500/10 text-green-500", action: () => toast.info("Call - Coming Soon") },
    { label: "Team Chat", icon: MessageSquare, color: "bg-purple-500/10 text-purple-500", action: () => toast.info("Chat - Coming Soon") },
    { label: "Share Update", icon: Share2, color: "bg-cyan-500/10 text-cyan-500", action: () => toast.info("Share Update - Coming Soon") },
  ];

  const stats = [
    { label: "Team Members", value: "2", icon: Users, trend: "+1 this month", color: "text-blue-500" },
    { label: "Active Projects", value: "5", icon: FolderKanban, trend: "+2 new", color: "text-purple-500" },
    { label: "Products Listed", value: "12", icon: Package, trend: "3 pending", color: "text-green-500" },
    { label: "Pending Orders", value: "8", icon: ShoppingCart, trend: "₹45,000", color: "text-orange-500" },
    { label: "Total Revenue", value: "₹1.2L", icon: DollarSign, trend: "+15%", color: "text-emerald-500" },
    { label: "Website Visits", value: "2.5K", icon: Eye, trend: "+23%", color: "text-cyan-500" },
  ];

  const recentNotices = [
    { id: 1, title: "Team Meeting Tomorrow", date: "Today", priority: "high", to: "All Team" },
    { id: 2, title: "New Product Launch Prep", date: "Yesterday", priority: "medium", to: "Production" },
    { id: 3, title: "Website Maintenance", date: "2 days ago", priority: "low", to: "Developer" },
  ];

  const pendingTasks = [
    { id: 1, title: "Review new product designs", status: "pending", priority: "high" },
    { id: 2, title: "Approve salary for Jan", status: "pending", priority: "high" },
    { id: 3, title: "Sign partnership agreement", status: "in-progress", priority: "medium" },
    { id: 4, title: "Update company policies", status: "pending", priority: "low" },
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
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
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground font-bold">5</span>
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="w-5 h-5" />
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
          className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-6 mb-8 border border-yellow-500/20"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                Welcome back, Kapeesh! 
                <Crown className="w-6 h-6 text-yellow-500" />
              </h2>
              <p className="text-muted-foreground">You have <span className="text-primary font-semibold">full control</span> over ASIREX. Manage your team, content, and website.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 gap-1">
                <Crown className="w-3 h-3" />
                Super Admin
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                Full Access
              </Badge>
              <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30">
                <CheckCircle className="w-3 h-3" />
                Online
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {primaryActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                onClick={action.action}
                className={`w-full h-16 ${action.color} flex items-center justify-center gap-3 text-lg font-semibold shadow-lg`}
              >
                <action.icon className="w-6 h-6" />
                {action.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-green-500 mt-1">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Content Actions Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {contentActions.map((action, index) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={action.action}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} transition-all hover:scale-105`}
                    >
                      <action.icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Pending Tasks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pending Tasks
                  </CardTitle>
                  <Badge variant="outline">{pendingTasks.length} tasks</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === "high" ? "bg-red-500" :
                        task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <Badge variant="outline" className="text-xs mt-1 capitalize">{task.status}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New product added</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New order received - ₹2,500</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Vaibhav updated production</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Communication Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  Quick Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {communicationActions.map((action, index) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      onClick={action.action}
                      className={`h-14 flex items-center justify-center gap-2 ${action.color}`}
                    >
                      <action.icon className="w-5 h-5" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            {/* Team Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-500" />
                  Team Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {teamActions.map((action, index) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={action.action}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} transition-all hover:scale-105`}
                    >
                      <action.icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <div className="flex gap-2">
                  <Button className="gap-2 bg-green-500 hover:bg-green-600" onClick={() => toast.info("Add Team Member - Coming Soon")}>
                    <UserPlus className="w-4 h-4" />
                    Hire New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* CEO Card */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">Kapeesh Sorout</h3>
                        <Badge className="bg-yellow-500/20 text-yellow-500">You</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">CEO & Founder • Executive Leadership</p>
                      <p className="text-xs text-muted-foreground">Ceo@asirex.in</p>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500/30">Active</Badge>
                  </div>

                  {/* Team Members */}
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border hover:border-primary/30 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{member.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">ID: {member.id}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-green-500">{member.salary}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-500 border-green-500/30">Active</Badge>
                        <Button variant="outline" size="icon" onClick={() => toast.info("Edit Member - Coming Soon")}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => toast.info("Message - Coming Soon")}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => toast.info("Remove Member - Coming Soon")}>
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Vacant Positions */}
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <UserPlus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-muted-foreground">4 Vacant Positions</h3>
                      <p className="text-sm text-muted-foreground">Core Members Lead, Sales Lead, Engineering Lead, Website Admin</p>
                    </div>
                    <Button className="bg-green-500 hover:bg-green-600" onClick={() => toast.info("Post Job - Coming Soon")}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Post Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Products", icon: Package, color: "text-blue-500 bg-blue-500/10", count: "12", path: "/admin/products" },
                { label: "Projects", icon: FolderKanban, color: "text-purple-500 bg-purple-500/10", count: "5", path: "/admin/projects" },
                { label: "Events", icon: Calendar, color: "text-orange-500 bg-orange-500/10", count: "6", path: "/admin/events" },
                { label: "Site Content", icon: FileText, color: "text-cyan-500 bg-cyan-500/10", count: "—", path: "/admin/content" },
                { label: "Messages", icon: MessageSquare, color: "text-green-500 bg-green-500/10", count: "8", path: "/admin/messages" },
                { label: "Orders", icon: ShoppingCart, color: "text-pink-500 bg-pink-500/10", count: "15", path: "/admin/orders" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg" onClick={() => navigate(item.path)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center`}>
                          <item.icon className="w-7 h-7" />
                        </div>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">Manage {item.label.toLowerCase()}</p>
                      <Button variant="ghost" className="w-full mt-4 gap-2">
                        Open <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="website" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Website Control Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {websiteActions.map((action, index) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={action.action}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} transition-all hover:scale-105`}
                    >
                      <action.icon className="w-6 h-6" />
                      <span className="text-sm font-medium text-center">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Website Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="w-8 h-8 text-blue-500" />
                    <Badge className="bg-green-500/20 text-green-500">+23%</Badge>
                  </div>
                  <p className="text-3xl font-bold">2,547</p>
                  <p className="text-sm text-muted-foreground">Total Page Views</p>
                  <Progress value={75} className="mt-3" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-purple-500" />
                    <Badge className="bg-green-500/20 text-green-500">+15%</Badge>
                  </div>
                  <p className="text-3xl font-bold">892</p>
                  <p className="text-sm text-muted-foreground">Unique Visitors</p>
                  <Progress value={60} className="mt-3" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingCart className="w-8 h-8 text-green-500" />
                    <Badge className="bg-green-500/20 text-green-500">+8%</Badge>
                  </div>
                  <p className="text-3xl font-bold">3.2%</p>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <Progress value={32} className="mt-3" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notices" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-yellow-500" />
                  Notices & Announcements
                </CardTitle>
                <Button className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => toast.info("Create Notice - Coming Soon")}>
                  <PlusCircle className="w-4 h-4" />
                  Post Notice
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNotices.map((notice) => (
                    <div key={notice.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className={`w-4 h-4 rounded-full mt-1 ${
                        notice.priority === "high" ? "bg-red-500" :
                        notice.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{notice.title}</h3>
                          <Badge variant="outline" className="text-xs capitalize">
                            {notice.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{notice.date}</span>
                          <span>•</span>
                          <span>To: {notice.to}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CEODashboard;