import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Search, Filter, Download, RefreshCw, Shield, 
  User, Clock, Activity, ChevronDown, ChevronUp,
  Users, Package, FolderKanban, Calendar, Bell,
  Settings, CreditCard, Truck
} from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  action_details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const actionCategories = [
  { value: "all", label: "All Actions" },
  { value: "team", label: "Team Management" },
  { value: "task", label: "Task Management" },
  { value: "order", label: "Order Management" },
  { value: "project", label: "Project Management" },
  { value: "salary", label: "Salary & Expenses" },
  { value: "notice", label: "Notices" },
  { value: "settings", label: "Settings" },
  { value: "user", label: "User Management" },
];

const getActionIcon = (actionType: string) => {
  if (actionType.startsWith("team_member")) return <Users className="w-4 h-4" />;
  if (actionType.startsWith("task")) return <Activity className="w-4 h-4" />;
  if (actionType.startsWith("order")) return <Package className="w-4 h-4" />;
  if (actionType.startsWith("project")) return <FolderKanban className="w-4 h-4" />;
  if (actionType.startsWith("meeting")) return <Calendar className="w-4 h-4" />;
  if (actionType.startsWith("salary") || actionType.startsWith("expense")) return <CreditCard className="w-4 h-4" />;
  if (actionType.startsWith("notice")) return <Bell className="w-4 h-4" />;
  if (actionType.startsWith("settings") || actionType.startsWith("maintenance")) return <Settings className="w-4 h-4" />;
  if (actionType.startsWith("user")) return <User className="w-4 h-4" />;
  return <Shield className="w-4 h-4" />;
};

const getActionColor = (actionType: string) => {
  if (actionType.includes("deleted") || actionType.includes("fired") || actionType.includes("rejected") || actionType.includes("cancelled")) {
    return "bg-red-500/20 text-red-500";
  }
  if (actionType.includes("added") || actionType.includes("created") || actionType.includes("approved") || actionType.includes("completed")) {
    return "bg-green-500/20 text-green-500";
  }
  if (actionType.includes("updated") || actionType.includes("changed")) {
    return "bg-blue-500/20 text-blue-500";
  }
  if (actionType.includes("shipped") || actionType.includes("delivered")) {
    return "bg-cyan-500/20 text-cyan-500";
  }
  return "bg-yellow-500/20 text-yellow-500";
};

const formatActionType = (actionType: string) => {
  return actionType
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function AuditLogViewer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("week");

  // Fetch audit logs
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["audit-logs", categoryFilter, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      // Apply date filter
      const now = new Date();
      if (dateFilter === "today") {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte("created_at", todayStart);
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", weekAgo);
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", monthAgo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("audit-logs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Filter logs
  const filteredLogs = logs?.filter((log) => {
    // Search filter
    const matchesSearch = 
      log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.action_details).toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    let matchesCategory = true;
    if (categoryFilter !== "all") {
      const categoryMap: Record<string, string[]> = {
        team: ["team_member"],
        task: ["task"],
        order: ["order"],
        project: ["project"],
        salary: ["salary", "expense"],
        notice: ["notice"],
        settings: ["settings", "maintenance"],
        user: ["user", "login", "logout"],
      };
      const prefixes = categoryMap[categoryFilter] || [];
      matchesCategory = prefixes.some(prefix => log.action_type.startsWith(prefix));
    }

    return matchesSearch && matchesCategory;
  }) || [];

  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const exportToCSV = () => {
    if (!filteredLogs.length) return;

    const headers = ["Date", "Action Type", "Details", "User ID"];
    const rows = filteredLogs.map(log => [
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
      log.action_type,
      JSON.stringify(log.action_details),
      log.user_id,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Audit Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {actionCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
            <SelectTrigger className="w-[140px]">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          Showing {filteredLogs.length} log entries
        </p>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No audit logs found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Admin actions will be recorded here for security compliance
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogs.has(log.id);
                const details = log.action_details as Record<string, any>;

                return (
                  <div
                    key={log.id}
                    className="p-3 bg-muted/30 rounded-lg border border-border/50 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => toggleExpanded(log.id)}
                    >
                      <div className={`p-2 rounded-lg ${getActionColor(log.action_type)}`}>
                        {getActionIcon(log.action_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={getActionColor(log.action_type)}>
                            {formatActionType(log.action_type)}
                          </Badge>
                          {details.member_name && (
                            <span className="text-sm font-medium">{details.member_name}</span>
                          )}
                          {details.task_title && (
                            <span className="text-sm font-medium">{details.task_title}</span>
                          )}
                          {details.customer_name && (
                            <span className="text-sm font-medium">{details.customer_name}</span>
                          )}
                          {details.title && (
                            <span className="text-sm font-medium">{details.title}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(log.created_at), "MMM d, yyyy • h:mm:ss a")}
                        </p>
                      </div>

                      <Button variant="ghost" size="icon" className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(details)
                            .filter(([key]) => key !== "timestamp")
                            .map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/_/g, " ")}:
                                </span>{" "}
                                <span className="font-medium">
                                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>User ID: {log.user_id}</p>
                          {log.user_agent && (
                            <p className="truncate">User Agent: {log.user_agent}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
