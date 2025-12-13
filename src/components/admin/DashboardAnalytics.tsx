import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingCart, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";

interface AnalyticsData {
  salesData: { date: string; revenue: number; orders: number }[];
  userGrowth: { date: string; users: number; cumulative: number }[];
  orderStats: { status: string; count: number; value: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--secondary))",
  },
  users: {
    label: "New Users",
    color: "hsl(var(--accent))",
  },
  cumulative: {
    label: "Total Users",
    color: "hsl(var(--primary))",
  },
};

export function DashboardAnalytics() {
  const [timeRange, setTimeRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    salesData: [],
    userGrowth: [],
    orderStats: [],
    monthlyRevenue: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

      // Fetch orders for sales data
      const { data: ordersData } = await supabase
        .from("orders")
        .select("created_at, total_amount, order_status, payment_status")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Fetch user profiles for growth data
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Fetch all profiles for cumulative count
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("created_at")
        .lt("created_at", startDate.toISOString());

      const baseUserCount = allProfiles?.length || 0;

      // Process sales data by day
      const salesByDay = dateRange.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const dayOrders = ordersData?.filter(
          (o) => format(parseISO(o.created_at), "yyyy-MM-dd") === dateStr
        ) || [];
        
        return {
          date: format(date, "MMM dd"),
          revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          orders: dayOrders.length,
        };
      });

      // Process user growth by day
      let cumulativeUsers = baseUserCount;
      const userGrowthByDay = dateRange.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const newUsers = profilesData?.filter(
          (p) => format(parseISO(p.created_at), "yyyy-MM-dd") === dateStr
        ).length || 0;
        
        cumulativeUsers += newUsers;
        
        return {
          date: format(date, "MMM dd"),
          users: newUsers,
          cumulative: cumulativeUsers,
        };
      });

      // Order status breakdown
      const { data: allOrders } = await supabase
        .from("orders")
        .select("order_status, total_amount");

      const statusCounts: Record<string, { count: number; value: number }> = {};
      allOrders?.forEach((order) => {
        const status = order.order_status || "pending";
        if (!statusCounts[status]) {
          statusCounts[status] = { count: 0, value: 0 };
        }
        statusCounts[status].count++;
        statusCounts[status].value += order.total_amount || 0;
      });

      const orderStats = Object.entries(statusCounts).map(([status, data]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: data.count,
        value: data.value,
      }));

      // Monthly revenue for the last 6 months
      const monthlyRevenue: { month: string; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        const { data: monthOrders } = await supabase
          .from("orders")
          .select("total_amount")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());

        monthlyRevenue.push({
          month: format(date, "MMM yyyy"),
          revenue: monthOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        });
      }

      setAnalytics({
        salesData: salesByDay,
        userGrowth: userGrowthByDay,
        orderStats,
        monthlyRevenue,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = analytics.salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = analytics.salesData.reduce((sum, d) => sum + d.orders, 0);
  const totalNewUsers = analytics.userGrowth.reduce((sum, d) => sum + d.users, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics Overview</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Revenue</span>
              </div>
              <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm font-medium">Orders</span>
              </div>
              <p className="text-2xl font-bold">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">Avg: ₹{avgOrderValue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">New Users</span>
              </div>
              <p className="text-2xl font-bold">{totalNewUsers}</p>
              <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Growth</span>
              </div>
              <p className="text-2xl font-bold">
                {analytics.userGrowth.length > 0 
                  ? analytics.userGrowth[analytics.userGrowth.length - 1].cumulative 
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">Total users</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <AreaChart data={analytics.salesData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <LineChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={analytics.orderStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="status" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--secondary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
