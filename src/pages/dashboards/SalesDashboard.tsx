import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  DollarSign,
  Users,
  Target,
  ShoppingCart,
  Phone,
  Mail,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const name = searchParams.get("name") || "Sales Lead";
  const title = searchParams.get("title") || "Sales Lead and Head";
  const department = searchParams.get("department") || "Sales & Marketing";

  useEffect(() => {
    const fetchData = async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
      ]);
      
      if (!ordersRes.error) setOrders(ordersRes.data || []);
      if (!productsRes.error) setProducts(productsRes.data || []);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const thisMonthOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", trend: "+12%" },
    { label: "This Month", value: `₹${thisMonthRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-blue-500", trend: "+8%" },
    { label: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, color: "text-purple-500", trend: "+15%" },
    { label: "Avg Order Value", value: `₹${orders.length ? Math.round(totalRevenue / orders.length) : 0}`, icon: Target, color: "text-orange-500", trend: "+5%" },
  ];

  const salesTargets = [
    { label: "Monthly Revenue Target", current: thisMonthRevenue, target: 100000, unit: "₹" },
    { label: "Orders This Month", current: thisMonthOrders.length, target: 50, unit: "" },
    { label: "New Customers", current: 12, target: 20, unit: "" },
    { label: "Customer Retention", current: 85, target: 90, unit: "%" },
  ];

  const topProducts = products
    .slice(0, 5)
    .map((p, i) => ({ ...p, sales: Math.floor(Math.random() * 100) + 10, rank: i + 1 }));

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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{name}</h1>
              <p className="text-sm text-muted-foreground">{title} • {department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[10px] flex items-center justify-center text-white">
                {thisMonthOrders.length}
              </span>
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
          className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl p-6 mb-8 border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Sales Dashboard 📈</h2>
              <p className="text-muted-foreground">Track revenue, orders, and sales performance metrics</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-500">
                <TrendingUp className="w-3 h-3" />
                Sales Lead
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
              <Card className="hover:border-green-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <div className="flex items-center text-green-500 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      {stat.trend}
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="targets">Targets</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-green-500" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : orders.slice(0, 5).length === 0 ? (
                    <p className="text-muted-foreground">No orders yet</p>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">₹{order.total_amount}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{order.order_status}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Sales Targets Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Monthly Targets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {salesTargets.slice(0, 3).map((target) => (
                    <div key={target.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{target.label}</span>
                        <span className="text-sm font-medium">
                          {target.unit === "₹" ? `₹${target.current.toLocaleString()}` : target.current}{target.unit !== "₹" ? target.unit : ""} / {target.unit === "₹" ? `₹${target.target.toLocaleString()}` : target.target}{target.unit !== "₹" ? target.unit : ""}
                        </span>
                      </div>
                      <Progress value={Math.min((target.current / target.target) * 100, 100)} className="h-2" />
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full gap-1" onClick={() => setActiveTab("targets")}>
                    View All Targets <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="targets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Targets & Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {salesTargets.map((target) => {
                    const percentage = Math.min((target.current / target.target) * 100, 100);
                    return (
                      <div key={target.label} className="p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">{target.label}</h3>
                          <Badge variant={percentage >= 80 ? "default" : percentage >= 50 ? "secondary" : "destructive"}>
                            {Math.round(percentage)}%
                          </Badge>
                        </div>
                        <p className="text-3xl font-bold mb-2">
                          {target.unit === "₹" ? `₹${target.current.toLocaleString()}` : target.current}{target.unit !== "₹" ? target.unit : ""}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Target: {target.unit === "₹" ? `₹${target.target.toLocaleString()}` : target.target}{target.unit !== "₹" ? target.unit : ""}
                        </p>
                        <Progress value={percentage} className="h-3" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        #{product.rank}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{product.price} • {product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{product.sales} sold</p>
                        <p className="text-sm text-green-500">₹{product.sales * product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Lead Tracking Module</h3>
                  <p className="text-muted-foreground">Manage potential customers and follow-ups</p>
                  <Button variant="outline" className="mt-4">Coming Soon</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SalesDashboard;
