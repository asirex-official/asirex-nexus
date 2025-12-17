import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { 
  CheckCircle, Clock, AlertCircle, Trash2, Edit, User, Calendar,
  AlertTriangle, Filter, Search, Plus, ArrowUp, ArrowDown, Target
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  created_at: string;
}

interface TeamMember {
  id: string;
  name: string;
  user_id: string | null;
}

export function AdminTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    assigned_to: ""
  });

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('admin-tasks-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    const [tasksRes, teamRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('id, name, user_id').eq('status', 'active')
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (teamRes.data) setTeamMembers(teamRes.data);
    setLoading(false);
  };

  const getAssigneeName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    const member = teamMembers.find(m => m.user_id === userId);
    return member?.name || "Unknown";
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Task status updated");
      fetchData();
    }
  };

  const deleteTask = async (taskId: string) => {
    // First delete comments
    await supabase.from('task_comments').delete().eq('task_id', taskId);
    
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      toast.error("Failed to delete task");
    } else {
      toast.success("Task deleted");
      fetchData();
    }
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      status: task.status || "pending",
      priority: task.priority || "medium",
      due_date: task.due_date ? task.due_date.split('T')[0] : "",
      assigned_to: task.assigned_to || ""
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedTask) return;

    const { error } = await supabase
      .from('tasks')
      .update({
        title: editForm.title,
        description: editForm.description || null,
        status: editForm.status,
        priority: editForm.priority,
        due_date: editForm.due_date ? new Date(editForm.due_date).toISOString() : null,
        assigned_to: editForm.assigned_to || null
      })
      .eq('id', selectedTask.id);

    if (error) {
      toast.error("Failed to update task");
    } else {
      toast.success("Task updated successfully");
      setShowEditDialog(false);
      fetchData();
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    const colors: Record<string, string> = {
      high: "bg-red-500/10 text-red-500 border-red-500/30",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      low: "bg-blue-500/10 text-blue-500 border-blue-500/30"
    };
    return colors[priority || "low"] || colors.low;
  };

  const getDeadlineStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    
    if (isPast(due) && !isToday(due)) {
      return { text: "Overdue", color: "text-red-500", icon: <AlertTriangle className="h-3 w-3" /> };
    }
    if (isToday(due)) {
      return { text: "Due today", color: "text-orange-500", icon: <Clock className="h-3 w-3" /> };
    }
    if (isTomorrow(due)) {
      return { text: "Due tomorrow", color: "text-yellow-500", icon: <Clock className="h-3 w-3" /> };
    }
    return { text: formatDistanceToNow(due, { addSuffix: true }), color: "text-muted-foreground", icon: <Calendar className="h-3 w-3" /> };
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats
  const overdueTasks = tasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && t.status !== 'completed').length;
  const todayTasks = tasks.filter(t => t.due_date && isToday(new Date(t.due_date)) && t.status !== 'completed').length;

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Deadline Alerts */}
      {(overdueTasks > 0 || todayTasks > 0) && (
        <div className="flex gap-4">
          {overdueTasks > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">{overdueTasks} overdue task(s)</span>
            </div>
          )}
          {todayTasks > 0 && (
            <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">{todayTasks} task(s) due today</span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const deadline = getDeadlineStatus(task.due_date);
            return (
              <Card key={task.id} className={`bg-card/50 border-border/50 ${
                deadline?.text === "Overdue" && task.status !== 'completed' ? 'border-red-500/50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge variant="outline" className={getPriorityBadge(task.priority)}>
                          {task.priority === 'high' && <ArrowUp className="h-3 w-3 mr-1" />}
                          {task.priority === 'low' && <ArrowDown className="h-3 w-3 mr-1" />}
                          {task.priority || 'normal'}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-3 w-3" />
                          {getAssigneeName(task.assigned_to)}
                        </span>
                        {deadline && task.status !== 'completed' && (
                          <span className={`flex items-center gap-1 ${deadline.color}`}>
                            {deadline.icon}
                            {deadline.text}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select
                        value={task.status || 'pending'}
                        onValueChange={(value) => updateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={editForm.priority} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={editForm.due_date}
                onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select value={editForm.assigned_to} onValueChange={(v) => setEditForm({ ...editForm, assigned_to: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {teamMembers.filter(m => m.user_id).map((member) => (
                    <SelectItem key={member.id} value={member.user_id!}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
