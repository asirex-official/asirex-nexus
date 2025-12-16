import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle, Clock, AlertCircle, MessageSquare, Send, User } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  assigned_by: string | null;
  created_at: string;
}

interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export function TaskManagementView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Record<string, TaskComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('tasks-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          () => fetchTasks()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const fetchComments = async (taskId: string) => {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(prev => ({ ...prev, [taskId]: data || [] }));
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Task status updated" });
      fetchTasks();
    }
  };

  const addComment = async (taskId: string) => {
    const commentText = newComment[taskId]?.trim();
    if (!commentText || !user) return;

    const { error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        comment: commentText
      });

    if (error) {
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    } else {
      setNewComment(prev => ({ ...prev, [taskId]: '' }));
      fetchComments(taskId);
      toast({ title: "Comment added" });
    }
  };

  const toggleExpand = (taskId: string) => {
    if (expandedTask === taskId) {
      setExpandedTask(null);
    } else {
      setExpandedTask(taskId);
      if (!comments[taskId]) {
        fetchComments(taskId);
      }
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tasks assigned to you</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <CardTitle className="text-lg">{task.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(task.priority) as any}>
                  {task.priority || 'normal'}
                </Badge>
                {task.due_date && (
                  <Badge variant="outline" className="text-xs">
                    Due: {format(new Date(task.due_date), 'MMM d, h:mm a')}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select
                  value={task.status || 'pending'}
                  onValueChange={(value) => updateTaskStatus(task.id, value)}
                >
                  <SelectTrigger className="w-36 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(task.id)}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Comments {comments[task.id]?.length ? `(${comments[task.id].length})` : ''}
              </Button>
            </div>

            {expandedTask === task.id && (
              <div className="border-t border-border/50 pt-4 space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments[task.id]?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet. Add one below.
                    </p>
                  )}
                  {comments[task.id]?.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{comment.comment}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment or update..."
                    value={newComment[task.id] || ''}
                    onChange={(e) => setNewComment(prev => ({ ...prev, [task.id]: e.target.value }))}
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    size="icon"
                    onClick={() => addComment(task.id)}
                    disabled={!newComment[task.id]?.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
