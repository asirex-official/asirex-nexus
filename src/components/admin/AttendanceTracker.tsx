import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Clock, LogIn, LogOut, Coffee, Play, Users, 
  Calendar, Timer, Search, Filter
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { 
  useAttendance, 
  useAllTodayAttendance,
  useTodayAttendance,
  useClockIn,
  useClockOut,
  useStartBreak,
  useEndBreak,
  AttendanceRecord
} from "@/hooks/useAttendance";

interface AttendanceTrackerProps {
  isAdmin?: boolean;
}

export function AttendanceTracker({ isAdmin = false }: AttendanceTrackerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"today" | "all">("today");

  const { data: allAttendance, isLoading: loadingAll } = useAttendance();
  const { data: todayAttendance, isLoading: loadingToday } = useAllTodayAttendance();
  const { data: myAttendance } = useTodayAttendance();

  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const startBreak = useStartBreak();
  const endBreak = useEndBreak();

  const displayData = viewMode === "today" ? todayAttendance : allAttendance;
  const isLoading = viewMode === "today" ? loadingToday : loadingAll;

  const filteredData = displayData?.filter(record => {
    const matchesSearch = 
      record.team_member?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.team_member?.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "clocked_in": return "bg-green-500/20 text-green-500";
      case "on_break": return "bg-yellow-500/20 text-yellow-500";
      case "clocked_out": return "bg-gray-500/20 text-gray-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleClockIn = async () => {
    try {
      await clockIn.mutateAsync();
      toast.success("Clocked in successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    if (!myAttendance?.id) return;
    try {
      await clockOut.mutateAsync(myAttendance.id);
      toast.success("Clocked out successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to clock out");
    }
  };

  const handleStartBreak = async () => {
    if (!myAttendance?.id) return;
    try {
      await startBreak.mutateAsync(myAttendance.id);
      toast.success("Break started!");
    } catch (error: any) {
      toast.error(error.message || "Failed to start break");
    }
  };

  const handleEndBreak = async () => {
    if (!myAttendance?.id) return;
    try {
      await endBreak.mutateAsync(myAttendance.id);
      toast.success("Back to work!");
    } catch (error: any) {
      toast.error(error.message || "Failed to end break");
    }
  };

  // Calculate stats
  const stats = {
    clockedIn: todayAttendance?.filter(r => r.status === "clocked_in").length || 0,
    onBreak: todayAttendance?.filter(r => r.status === "on_break").length || 0,
    clockedOut: todayAttendance?.filter(r => r.status === "clocked_out").length || 0,
    total: todayAttendance?.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Personal Clock In/Out Card */}
      {!isAdmin && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              My Attendance Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                {myAttendance ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(myAttendance.status)}>
                        {myAttendance.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Clocked in at {format(new Date(myAttendance.clock_in), "hh:mm a")}
                      </span>
                    </div>
                    {myAttendance.clock_out && (
                      <p className="text-sm">
                        Clocked out at {format(new Date(myAttendance.clock_out), "hh:mm a")} • 
                        Total: {myAttendance.total_hours?.toFixed(2)} hours
                      </p>
                    )}
                    {!myAttendance.clock_out && (
                      <p className="text-sm text-muted-foreground">
                        Working for {formatDistanceToNow(new Date(myAttendance.clock_in))}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">You haven't clocked in today</p>
                )}
              </div>

              <div className="flex gap-2">
                {!myAttendance ? (
                  <Button onClick={handleClockIn} disabled={clockIn.isPending} className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Clock In
                  </Button>
                ) : myAttendance.status === "clocked_in" ? (
                  <>
                    <Button variant="outline" onClick={handleStartBreak} disabled={startBreak.isPending} className="gap-2">
                      <Coffee className="w-4 h-4" />
                      Start Break
                    </Button>
                    <Button variant="destructive" onClick={handleClockOut} disabled={clockOut.isPending} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      Clock Out
                    </Button>
                  </>
                ) : myAttendance.status === "on_break" ? (
                  <>
                    <Button onClick={handleEndBreak} disabled={endBreak.isPending} className="gap-2">
                      <Play className="w-4 h-4" />
                      End Break
                    </Button>
                    <Button variant="destructive" onClick={handleClockOut} disabled={clockOut.isPending} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      Clock Out
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline" className="text-green-500">Completed for today</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats for Admins */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <LogIn className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.clockedIn}</p>
                  <p className="text-xs text-muted-foreground">Clocked In</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Coffee className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.onBreak}</p>
                  <p className="text-xs text-muted-foreground">On Break</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500/20">
                  <LogOut className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.clockedOut}</p>
                  <p className="text-xs text-muted-foreground">Clocked Out</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Attendance Records
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === "today" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("today")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </Button>
              <Button 
                variant={viewMode === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("all")}
              >
                All Records
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="clocked_in">Clocked In</SelectItem>
                <SelectItem value="on_break">On Break</SelectItem>
                <SelectItem value="clocked_out">Clocked Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Records List */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredData.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="relative">
                    {record.team_member?.profile_image ? (
                      <img
                        src={record.team_member.profile_image}
                        alt={record.team_member?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {record.team_member?.name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{record.team_member?.name || "Unknown"}</p>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {record.team_member?.department || "No department"}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {format(new Date(record.clock_in), "hh:mm a")}
                      {record.clock_out && ` - ${format(new Date(record.clock_out), "hh:mm a")}`}
                    </p>
                    <p className="text-muted-foreground">
                      {record.total_hours ? `${record.total_hours.toFixed(2)} hrs` : "In progress"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
