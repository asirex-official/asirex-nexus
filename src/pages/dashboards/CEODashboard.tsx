import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, Package, FolderKanban, Calendar, Bell, MessageSquare, Settings, UserPlus, UserMinus,
  Shield, TrendingUp, Briefcase, Megaphone, FileText, Video, LogOut, Crown, Zap, Globe,
  DollarSign, Eye, CheckCircle, Clock, MoreHorizontal, ArrowUpRight, Activity, ShoppingCart,
  Home, Building, ShoppingBag, Layers, Palette, PieChart, Search, Mail, Phone, Share2,
  Award, Gift, Target, BarChart3, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AddTeamMemberDialog, TeamMember } from "@/components/admin/AddTeamMemberDialog";
import { FireTeamMemberDialog } from "@/components/admin/FireTeamMemberDialog";
import { TeamActionDialog } from "@/components/admin/TeamActionDialog";
import { PostNoticeDialog, Notice } from "@/components/admin/PostNoticeDialog";
import { AddContentDialog } from "@/components/admin/AddContentDialog";
import { StartMeetingDialog } from "@/components/admin/StartMeetingDialog";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface DashboardStats {
  teamCount: number;
  projectsCount: number;
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
  pendingOrdersValue: number;
}

const CEODashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showAddMember, setShowAddMember] = useState(false);
  const [showFireMember, setShowFireMember] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [teamActionType, setTeamActionType] = useState<"role" | "promotion" | "bonus" | "salary" | "work" | null>(null);
  const [contentType, setContentType] = useState<"product" | "project" | "event" | "job" | null>(null);

  // Data states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    teamCount: 0,
    projectsCount: 0,
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    pendingOrdersValue: 0,
  });

  // Fetch data from Supabase
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch team members
      const { data: teamData } = await supabase
        .from('team_members')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (teamData) {
        const mappedTeam: TeamMember[] = teamData.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          department: m.department || '',
          status: m.status as 'active' | 'inactive',
          joinDate: m.hired_at?.split('T')[0] || '',
          salary: m.salary ? `₹${m.salary.toLocaleString()}/month` : 'To be decided',
          coreType: m.is_core_pillar ? 'Core Pillar' : 'Employee',
          serialNumber: m.serial_number || '',
        }));
        setTeamMembers(mappedTeam);
      }

      // Fetch notices
      const { data: noticesData } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (noticesData) {
        const mappedNotices: Notice[] = noticesData.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          priority: n.priority as 'high' | 'medium' | 'low',
          to: 'All Team',
          date: new Date(n.created_at).toLocaleDateString(),
          author: 'Kapeesh Sorout',
        }));
        setNotices(mappedNotices);
      }

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (tasksData) {
        setTasks(tasksData.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status || 'pending',
          priority: t.priority || 'medium',
        })));
      }

      // Fetch stats
      const [projectsRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('total_amount, order_status'),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const pendingOrders = orders.filter(o => o.order_status === 'pending');
      const pendingValue = pendingOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      setStats({
        teamCount: teamData?.length || 0,
        projectsCount: projectsRes.count || 0,
        productsCount: productsRes.count || 0,
        ordersCount: pendingOrders.length,
        totalRevenue,
        pendingOrdersValue: pendingValue,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleAddMember = (member: TeamMember) => {
    setTeamMembers([member, ...teamMembers]);
    setStats(prev => ({ ...prev, teamCount: prev.teamCount + 1 }));
  };

  const handleFireMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status: 'inactive' })
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
      setStats(prev => ({ ...prev, teamCount: prev.teamCount - 1 }));
      toast.success('Team member removed');
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast.error(error.message || 'Failed to remove team member');
    }
  };

  const handleTeamAction = async (memberId: string, data: Record<string, string>) => {
    try {
      const updateData: Record<string, any> = {};
      
      if (teamActionType === "role" && data.newRole) {
        updateData.role = data.newRole;
      } else if (teamActionType === "promotion" && data.newPosition) {
        updateData.role = data.newPosition;
        updateData.designation = data.newPosition;
      } else if (teamActionType === "salary" && data.newSalary) {
        updateData.salary = parseFloat(data.newSalary.replace(/[₹,]/g, ''));
      } else if (teamActionType === "bonus" && data.bonus) {
        const member = teamMembers.find(m => m.id === memberId);
        if (member) {
          const currentBonus = parseFloat(data.bonus.replace(/[₹,]/g, ''));
          updateData.bonus = currentBonus;
        }
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('team_members')
          .update(updateData)
          .eq('id', memberId);

        if (error) throw error;

        setTeamMembers(teamMembers.map((m) => {
          if (m.id !== memberId) return m;
          if (teamActionType === "role" && data.newRole) return { ...m, role: data.newRole };
          if (teamActionType === "promotion" && data.newPosition) return { ...m, role: data.newPosition };
          if (teamActionType === "salary" && data.newSalary) return { ...m, salary: data.newSalary };
          return m;
        }));

        toast.success('Team member updated');
      }
    } catch (error: any) {
      console.error('Error updating team member:', error);
      toast.error(error.message || 'Failed to update team member');
    }
  };

  const handlePostNotice = (notice: Notice) => {
    setNotices([notice, ...notices]);
  };

  const handleDeleteNotice = async (noticeId: string) => {
    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_active: false })
        .eq('id', noticeId);

      if (error) throw error;

      setNotices(notices.filter((n) => n.id !== noticeId));
      toast.success('Notice deleted');
    } catch (error: any) {
      console.error('Error deleting notice:', error);
      toast.error(error.message || 'Failed to delete notice');
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      toast.success('Task marked as complete');
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast.error(error.message || 'Failed to complete task');
    }
  };

  const handleAddContent = () => {
    // Refresh stats after adding content
    fetchDashboardData();
  };

  // Actions config
  const primaryActions = [
    { label: "Add Team Member", icon: UserPlus, color: "bg-green-500 hover:bg-green-600 text-white", action: () => setShowAddMember(true) },
    { label: "Fire Team Member", icon: UserMinus, color: "bg-red-500 hover:bg-red-600 text-white", action: () => setShowFireMember(true) },
    { label: "Start Meeting", icon: Video, color: "bg-blue-500 hover:bg-blue-600 text-white", action: () => setShowMeeting(true) },
    { label: "Post Notice", icon: Megaphone, color: "bg-yellow-500 hover:bg-yellow-600 text-white", action: () => setShowNotice(true) },
  ];

  const contentActions = [
    { label: "Add Product", icon: Package, color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20", action: () => setContentType("product") },
    { label: "Add Project", icon: FolderKanban, color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20", action: () => setContentType("project") },
    { label: "Add Event", icon: Calendar, color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20", action: () => setContentType("event") },
    { label: "Add Job Posting", icon: Briefcase, color: "bg-green-500/10 text-green-500 hover:bg-green-500/20", action: () => setContentType("job") },
    { label: "Edit Site Content", icon: FileText, color: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20", action: () => navigate("/admin/content") },
    { label: "Manage Orders", icon: ShoppingCart, color: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20", action: () => navigate("/admin/orders") },
  ];

  const teamActions = [
    { label: "Change Role", icon: Shield, color: "bg-purple-500/10 text-purple-500", action: () => setTeamActionType("role") },
    { label: "Give Promotion", icon: Award, color: "bg-yellow-500/10 text-yellow-500", action: () => setTeamActionType("promotion") },
    { label: "Give Bonus", icon: Gift, color: "bg-green-500/10 text-green-500", action: () => setTeamActionType("bonus") },
    { label: "Change Salary", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-500", action: () => setTeamActionType("salary") },
    { label: "Assign Work", icon: Target, color: "bg-blue-500/10 text-blue-500", action: () => setTeamActionType("work") },
    { label: "View Performance", icon: BarChart3, color: "bg-cyan-500/10 text-cyan-500", action: () => toast.info("Performance analytics coming soon") },
  ];

  const websiteActions = [
    { label: "Edit Homepage", icon: Home, color: "bg-primary/10 text-primary", action: () => navigate("/admin/visual-editor?page=homepage") },
    { label: "Edit About Page", icon: Building, color: "bg-blue-500/10 text-blue-500", action: () => navigate("/admin/visual-editor?page=about") },
    { label: "Edit Shop", icon: ShoppingBag, color: "bg-green-500/10 text-green-500", action: () => navigate("/admin/visual-editor?page=shop") },
    { label: "Edit Projects", icon: Layers, color: "bg-purple-500/10 text-purple-500", action: () => navigate("/admin/visual-editor?page=projects") },
    { label: "Edit Events", icon: Calendar, color: "bg-orange-500/10 text-orange-500", action: () => navigate("/admin/visual-editor?page=events") },
    { label: "Design System", icon: Palette, color: "bg-pink-500/10 text-pink-500", action: () => navigate("/admin/visual-editor?page=design-system") },
    { label: "View Analytics", icon: PieChart, color: "bg-cyan-500/10 text-cyan-500", action: () => toast.info("Analytics dashboard coming soon") },
    { label: "SEO Settings", icon: Search, color: "bg-yellow-500/10 text-yellow-500", action: () => toast.info("SEO settings coming soon") },
  ];

  const communicationActions = [
    { label: "Send Email", icon: Mail, color: "bg-blue-500/10 text-blue-500", action: () => toast.info("Email feature coming soon") },
    { label: "Call Team", icon: Phone, color: "bg-green-500/10 text-green-500", action: () => toast.info("Call feature coming soon") },
    { label: "Team Chat", icon: MessageSquare, color: "bg-purple-500/10 text-purple-500", action: () => toast.info("Chat feature coming soon") },
    { label: "Share Update", icon: Share2, color: "bg-cyan-500/10 text-cyan-500", action: () => toast.info("Share update feature coming soon") },
  ];

  const dashboardStats = [
    { label: "Team Members", value: stats.teamCount.toString(), icon: Users, trend: "+1 this month", color: "text-blue-500" },
    { label: "Active Projects", value: stats.projectsCount.toString(), icon: FolderKanban, trend: "+2 new", color: "text-purple-500" },
    { label: "Products Listed", value: stats.productsCount.toString(), icon: Package, trend: "3 pending", color: "text-green-500" },
    { label: "Pending Orders", value: stats.ordersCount.toString(), icon: ShoppingCart, trend: `₹${stats.pendingOrdersValue.toLocaleString()}`, color: "text-orange-500" },
    { label: "Total Revenue", value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, trend: "+15%", color: "text-emerald-500" },
    { label: "Website Visits", value: "2.5K", icon: Eye, trend: "+23%", color: "text-cyan-500" },
  ];

  const pendingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 4);

  const handleSignOut = () => {
    navigate("/");
    toast.success("Signed out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground font-bold">{notices.length}</span>
            </Button>
            <Button variant="ghost" size="icon"><MessageSquare className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-6 mb-8 border border-yellow-500/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">Welcome back, Kapeesh! <Crown className="w-6 h-6 text-yellow-500" /></h2>
              <p className="text-muted-foreground">You have <span className="text-primary font-semibold">full control</span> over ASIREX. Manage your team, content, and website.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 gap-1"><Crown className="w-3 h-3" />Super Admin</Badge>
              <Badge variant="outline" className="gap-1"><Globe className="w-3 h-3" />Full Access</Badge>
              <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30"><CheckCircle className="w-3 h-3" />Online</Badge>
            </div>
          </div>
        </motion.div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {primaryActions.map((action, index) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Button onClick={action.action} className={`w-full h-16 ${action.color} flex items-center justify-center gap-3 text-lg font-semibold shadow-lg`}>
                <action.icon className="w-6 h-6" />{action.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {dashboardStats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
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
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" />Content Management</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {contentActions.map((action, index) => (
                    <motion.button key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} onClick={action.action} className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} transition-all hover:scale-105`}>
                      <action.icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" />Pending Tasks</CardTitle>
                  <Badge variant="outline">{pendingTasks.length} tasks</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No pending tasks</p>
                  ) : (
                    pendingTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className={`w-3 h-3 rounded-full ${task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <Badge variant="outline" className="text-xs mt-1 capitalize">{task.status}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => handleTaskComplete(task.id)}><CheckCircle className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" />Recent Activity</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {notices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className={`flex items-center gap-3 p-3 rounded-lg ${notice.priority === "high" ? "bg-red-500/10" : notice.priority === "medium" ? "bg-yellow-500/10" : "bg-green-500/10"}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notice.priority === "high" ? "bg-red-500/20" : notice.priority === "medium" ? "bg-yellow-500/20" : "bg-green-500/20"}`}>
                        <Bell className={`w-5 h-5 ${notice.priority === "high" ? "text-red-500" : notice.priority === "medium" ? "text-yellow-500" : "text-green-500"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notice.title}</p>
                        <p className="text-xs text-muted-foreground">{notice.date}</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" />Team Management Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {teamActions.map((action, index) => (
                    <motion.button key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} onClick={action.action} className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} transition-all hover:scale-105`}>
                      <action.icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Team Members ({teamMembers.length})</CardTitle>
                <Button onClick={() => setShowAddMember(true)} className="bg-green-500 hover:bg-green-600 gap-2"><UserPlus className="w-4 h-4" />Add Member</Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${member.role === "CEO & Founder" ? "bg-gradient-to-br from-yellow-500 to-orange-500" : "bg-gradient-to-br from-blue-500 to-purple-500"}`}>
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{member.name}</p>
                          {member.coreType && <Badge variant="outline" className="text-xs">{member.coreType}</Badge>}
                          <Badge className={`text-xs ${member.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>{member.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.department} • {member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{member.salary}</p>
                        <p className="text-xs text-muted-foreground">ID: {member.serialNumber || member.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Content Publishing</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Products", icon: Package, count: stats.productsCount, color: "text-blue-500", action: () => setContentType("product") },
                    { label: "Projects", icon: FolderKanban, count: stats.projectsCount, color: "text-purple-500", action: () => setContentType("project") },
                    { label: "Events", icon: Calendar, count: 8, color: "text-orange-500", action: () => setContentType("event") },
                    { label: "Job Postings", icon: Briefcase, count: 3, color: "text-green-500", action: () => setContentType("job") },
                  ].map((item) => (
                    <Card key={item.label} className="cursor-pointer hover:border-primary/50 transition-all" onClick={item.action}>
                      <CardContent className="p-6 text-center">
                        <item.icon className={`w-10 h-10 mx-auto mb-3 ${item.color}`} />
                        <p className="text-2xl font-bold">{item.count}</p>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <Button variant="outline" size="sm" className="mt-3 w-full">Add New</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="website" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />Website Controls</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {websiteActions.map((action, index) => (
                    <motion.button key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} onClick={action.action} className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} transition-all hover:scale-105`}>
                      <action.icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-500" />Communication</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {communicationActions.map((action, index) => (
                    <motion.button key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} onClick={action.action} className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} transition-all hover:scale-105`}>
                      <action.icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notices" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-yellow-500" />Notices & Announcements</CardTitle>
                <Button onClick={() => setShowNotice(true)} className="bg-yellow-500 hover:bg-yellow-600 gap-2"><Megaphone className="w-4 h-4" />Post Notice</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {notices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No notices posted yet</p>
                ) : (
                  notices.map((notice) => (
                    <div key={notice.id} className={`p-4 rounded-xl border ${notice.priority === "high" ? "border-red-500/30 bg-red-500/5" : notice.priority === "medium" ? "border-yellow-500/30 bg-yellow-500/5" : "border-green-500/30 bg-green-500/5"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-xs ${notice.priority === "high" ? "bg-red-500/20 text-red-500" : notice.priority === "medium" ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500"}`}>{notice.priority}</Badge>
                            <span className="text-xs text-muted-foreground">To: {notice.to}</span>
                          </div>
                          <p className="font-semibold">{notice.title}</p>
                          {notice.content && <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>}
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{notice.date}</p>
                            <p>{notice.author}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDeleteNotice(notice.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AddTeamMemberDialog open={showAddMember} onOpenChange={setShowAddMember} onAdd={handleAddMember} />
      <FireTeamMemberDialog open={showFireMember} onOpenChange={setShowFireMember} members={teamMembers} onFire={handleFireMember} />
      <StartMeetingDialog open={showMeeting} onOpenChange={setShowMeeting} members={teamMembers} />
      <PostNoticeDialog open={showNotice} onOpenChange={setShowNotice} onPost={handlePostNotice} />
      {teamActionType && (
        <TeamActionDialog open={!!teamActionType} onOpenChange={(open) => !open && setTeamActionType(null)} members={teamMembers} actionType={teamActionType} onAction={handleTeamAction} />
      )}
      {contentType && (
        <AddContentDialog open={!!contentType} onOpenChange={(open) => !open && setContentType(null)} contentType={contentType} onAdd={handleAddContent} />
      )}
    </div>
  );
};

export default CEODashboard;
