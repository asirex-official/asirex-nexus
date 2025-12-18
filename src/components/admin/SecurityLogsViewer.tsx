import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert, Clock, User, Globe, Monitor, Search, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SecurityLog {
  id: string;
  user_id: string;
  action_type: string;
  action_details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_name?: string;
}

const getActionIcon = (actionType: string) => {
  if (actionType.includes("login") || actionType.includes("auth")) return ShieldCheck;
  if (actionType.includes("failed") || actionType.includes("error")) return ShieldAlert;
  return Shield;
};

const getActionColor = (actionType: string) => {
  if (actionType.includes("failed") || actionType.includes("error")) return "text-destructive";
  if (actionType.includes("login") || actionType.includes("success")) return "text-green-500";
  if (actionType.includes("logout")) return "text-amber-500";
  return "text-blue-500";
};

export function SecurityLogsViewer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["security-logs"],
    queryFn: async () => {
      // Fetch activity logs
      const { data: activityLogs, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch profiles to get user names
      const userIds = [...new Set(activityLogs?.map(log => log.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds.length > 0 ? userIds : ["none"]);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      return activityLogs?.map(log => ({
        ...log,
        action_details: log.action_details as Record<string, any>,
        user_name: profileMap.get(log.user_id) || "Unknown User"
      })) as SecurityLog[];
    }
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.includes(searchTerm);
    
    const matchesFilter = filterType === "all" || 
      (filterType === "auth" && (log.action_type.includes("login") || log.action_type.includes("logout"))) ||
      (filterType === "admin" && log.action_type.includes("admin")) ||
      (filterType === "data" && (log.action_type.includes("create") || log.action_type.includes("update") || log.action_type.includes("delete")));
    
    return matchesSearch && matchesFilter;
  });

  const securityStats = {
    totalLogs: logs?.length || 0,
    loginAttempts: logs?.filter(l => l.action_type.includes("login")).length || 0,
    adminActions: logs?.filter(l => l.action_type.includes("admin")).length || 0,
    failedAttempts: logs?.filter(l => l.action_type.includes("failed")).length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Security Logs
          </h2>
          <p className="text-muted-foreground">Monitor security events and user activities</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{securityStats.totalLogs}</p>
              </div>
              <Shield className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Login Events</p>
                <p className="text-2xl font-bold text-green-500">{securityStats.loginAttempts}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admin Actions</p>
                <p className="text-2xl font-bold text-blue-500">{securityStats.adminActions}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Attempts</p>
                <p className="text-2xl font-bold text-destructive">{securityStats.failedAttempts}</p>
              </div>
              <ShieldAlert className="w-8 h-8 text-destructive/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by action, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="admin">Admin Actions</SelectItem>
                <SelectItem value="data">Data Changes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !filteredLogs?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No security logs found</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredLogs.map((log, index) => {
                  const Icon = getActionIcon(log.action_type);
                  const colorClass = getActionColor(log.action_type);
                  
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg bg-background ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium capitalize">
                            {log.action_type.replace(/_/g, " ")}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            <User className="w-3 h-3 mr-1" />
                            {log.user_name}
                          </Badge>
                        </div>
                        {log.action_details && Object.keys(log.action_details).length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {JSON.stringify(log.action_details).slice(0, 100)}...
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                          </span>
                          {log.ip_address && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {log.ip_address}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
