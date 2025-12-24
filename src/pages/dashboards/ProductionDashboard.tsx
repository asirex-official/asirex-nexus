import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Package,
  Calendar,
  Bell,
  TrendingUp,
  ChevronRight,
  LogOut,
  CheckCircle,
  Factory,
  Truck,
  ClipboardList,
  Box,
  Target,
  Video,
  Megaphone,
  Plus,
  IndianRupee,
  Calculator,
  BarChart3,
  Save,
  Trash2,
  Edit,
  PackageCheck,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { TaskManagementView } from "@/components/tasks/TaskManagementView";
import { useProductionTracking, ProductionRecord } from "@/hooks/useProductionTracking";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ProductionDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    products_in_production: 0,
    products_completed: 0,
    products_shipped: 0,
    unit_price: 50,
    notes: "",
  });

  // Profit calculator state
  const [calcProducts, setCalcProducts] = useState(0);
  const [calcPrice, setCalcPrice] = useState(50);
  const [calcCost, setCalcCost] = useState(30);
  
  const { orders, meetings, notices, notifications, unreadCount, isLoading, markAsRead, refetch } = useRealtimeNotifications();
  const { records, stats, isLoading: loadingProduction, addRecord, updateRecord, deleteRecord } = useProductionTracking();

  const name = searchParams.get("name") || "Vaibhav Ghatwal";
  const title = searchParams.get("title") || "Production Head and Manager";
  const department = searchParams.get("department") || "Production & Operations";

  const dashboardStats = [
    { 
      label: "Being Made", 
      value: stats.totalInProduction.toString(), 
      icon: Factory, 
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      amount: `₹${stats.pendingEarnings.toLocaleString()}`,
      amountLabel: "Pending"
    },
    { 
      label: "Completed", 
      value: stats.totalCompleted.toString(), 
      icon: PackageCheck, 
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      amount: `₹${stats.totalEarnings.toLocaleString()}`,
      amountLabel: "Earned"
    },
    { 
      label: "Shipped", 
      value: stats.totalShipped.toString(), 
      icon: Truck, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      amount: null,
      amountLabel: null
    },
    { 
      label: "Today Done", 
      value: stats.todayCompleted.toString(), 
      icon: CheckCircle, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      amount: `₹${(stats.todayCompleted * 50).toLocaleString()}`,
      amountLabel: "Today"
    },
  ];

  const productionQueue = orders.filter(o => o.order_status === "pending" || o.order_status === "processing").slice(0, 5);

  const handleSignOut = () => {
    navigate("/authority-login?type=admin");
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
      refetch();
    }
  };

  const handleAddRecord = () => {
    addRecord.mutate({
      products_in_production: formData.products_in_production,
      products_completed: formData.products_completed,
      products_shipped: formData.products_shipped,
      unit_price: formData.unit_price,
      notes: formData.notes || null,
    });
    setShowAddDialog(false);
    setFormData({
      products_in_production: 0,
      products_completed: 0,
      products_shipped: 0,
      unit_price: 50,
      notes: "",
    });
  };

  const handleUpdateRecord = () => {
    if (!editingRecord) return;
    updateRecord.mutate({
      id: editingRecord.id,
      products_in_production: formData.products_in_production,
      products_completed: formData.products_completed,
      products_shipped: formData.products_shipped,
      unit_price: formData.unit_price,
      notes: formData.notes || null,
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: ProductionRecord) => {
    setFormData({
      products_in_production: record.products_in_production,
      products_completed: record.products_completed,
      products_shipped: record.products_shipped,
      unit_price: record.unit_price,
      notes: record.notes || "",
    });
    setEditingRecord(record);
  };

  const profitPerProduct = calcPrice - calcCost;
  const totalRevenue = calcProducts * calcPrice;
  const totalCost = calcProducts * calcCost;
  const totalProfit = calcProducts * profitPerProduct;
  const profitMargin = calcPrice > 0 ? ((profitPerProduct / calcPrice) * 100).toFixed(1) : 0;

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Production Dashboard 🏭</h2>
              <p className="text-muted-foreground">Track manufacturing, earnings, and production metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4" />
                Add Production Entry
              </Button>
              <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-500">
                <Factory className="w-3 h-3" />
                Production Head
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:border-orange-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    {stat.amount && (
                      <Badge variant="outline" className={stat.color}>
                        {stat.amount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {stat.amountLabel && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.amountLabel}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Earnings Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-green-500" />
                    Earnings Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm font-medium">Total Earned</span>
                    <span className="text-xl font-bold text-green-500">₹{stats.totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg">
                    <span className="text-sm font-medium">Pending (In Production)</span>
                    <span className="text-xl font-bold text-yellow-500">₹{stats.pendingEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                    <span className="text-sm font-medium">Products Completed</span>
                    <span className="text-xl font-bold text-blue-500">{stats.totalCompleted}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Production Queue Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-orange-500" />
                    Order Queue
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
                          <p className="text-xs text-muted-foreground">₹{order.total_amount}</p>
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
            </div>

            {/* Recent Production Records */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Recent Production Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProduction ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : records.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No production records yet</p>
                    <Button onClick={() => setShowAddDialog(true)} variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add First Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {records.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="text-yellow-500">🏭 {record.products_in_production} making</span>
                            <span className="text-green-500">✓ {record.products_completed} done</span>
                            <span className="text-blue-500">🚚 {record.products_shipped} shipped</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-500">₹{record.total_earnings}</p>
                          <p className="text-xs text-muted-foreground">+₹{record.pending_earnings} pending</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Production Records Tab */}
          <TabsContent value="production" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-orange-500" />
                    Production Records
                  </CardTitle>
                  <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingProduction ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : records.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No production records</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div key={record.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{new Date(record.date).toLocaleDateString("en-IN", { 
                            weekday: "short", 
                            year: "numeric", 
                            month: "short", 
                            day: "numeric" 
                          })}</p>
                          <div className="flex gap-6 mt-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Factory className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-500 font-medium">{record.products_in_production}</span>
                              <span className="text-muted-foreground">in production</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <PackageCheck className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 font-medium">{record.products_completed}</span>
                              <span className="text-muted-foreground">completed</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Truck className="w-4 h-4 text-blue-500" />
                              <span className="text-blue-500 font-medium">{record.products_shipped}</span>
                              <span className="text-muted-foreground">shipped</span>
                            </div>
                          </div>
                          {record.notes && (
                            <p className="text-sm text-muted-foreground mt-2 italic">"{record.notes}"</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-500">₹{record.total_earnings.toLocaleString()}</p>
                          <p className="text-sm text-yellow-500">+₹{record.pending_earnings.toLocaleString()} pending</p>
                          <p className="text-xs text-muted-foreground">@₹{record.unit_price}/unit</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(record)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRecord.mutate(record.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profit Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-500" />
                  Profit Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label>Number of Products</Label>
                      <Input
                        type="number"
                        value={calcProducts}
                        onChange={(e) => setCalcProducts(Number(e.target.value))}
                        min={0}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Selling Price per Unit (₹)</Label>
                      <Input
                        type="number"
                        value={calcPrice}
                        onChange={(e) => setCalcPrice(Number(e.target.value))}
                        min={0}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Cost per Unit (₹)</Label>
                      <Input
                        type="number"
                        value={calcCost}
                        onChange={(e) => setCalcCost(Number(e.target.value))}
                        min={0}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10">
                      <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                      <p className="text-2xl font-bold text-red-500">₹{totalCost.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-500/10">
                      <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                      <p className="text-2xl font-bold text-green-500">₹{totalProfit.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{profitMargin}% margin</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/10">
                      <p className="text-sm text-muted-foreground mb-1">Profit per Product</p>
                      <p className="text-xl font-bold text-purple-500">₹{profitPerProduct.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
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

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Queue</span>
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

          {/* Meetings Tab */}
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

          {/* Notices Tab */}
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
        </Tabs>
      </main>

      {/* Add/Edit Record Dialog */}
      <Dialog open={showAddDialog || !!editingRecord} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingRecord(null);
          setFormData({
            products_in_production: 0,
            products_completed: 0,
            products_shipped: 0,
            unit_price: 50,
            notes: "",
          });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-orange-500" />
              {editingRecord ? "Edit Production Entry" : "Add Production Entry"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Products In Production</Label>
                <Input
                  type="number"
                  value={formData.products_in_production}
                  onChange={(e) => setFormData({ ...formData, products_in_production: Number(e.target.value) })}
                  min={0}
                  className="mt-1"
                />
                <p className="text-xs text-yellow-500 mt-1">
                  = ₹{(formData.products_in_production * formData.unit_price).toLocaleString()} pending
                </p>
              </div>
              <div>
                <Label>Products Completed</Label>
                <Input
                  type="number"
                  value={formData.products_completed}
                  onChange={(e) => setFormData({ ...formData, products_completed: Number(e.target.value) })}
                  min={0}
                  className="mt-1"
                />
                <p className="text-xs text-green-500 mt-1">
                  = ₹{(formData.products_completed * formData.unit_price).toLocaleString()} earned
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Products Shipped</Label>
                <Input
                  type="number"
                  value={formData.products_shipped}
                  onChange={(e) => setFormData({ ...formData, products_shipped: Number(e.target.value) })}
                  min={0}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Unit Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
                  min={0}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any notes about today's production..."
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setEditingRecord(null);
            }}>
              Cancel
            </Button>
            <Button onClick={editingRecord ? handleUpdateRecord : handleAddRecord} className="gap-2">
              <Save className="w-4 h-4" />
              {editingRecord ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionDashboard;
