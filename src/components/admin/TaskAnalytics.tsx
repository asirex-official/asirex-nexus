import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  TrendingUp,
  Target,
  Award
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  assigned_to: string | null;
  created_at: string;
  due_date: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  user_id: string | null;
}

export function TaskAnalytics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [tasksRes, teamRes] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('team_members').select('id, name, user_id')
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (teamRes.data) setTeamMembers(teamRes.data);
    setLoading(false);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || !t.status).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  // Team productivity
  const getTeamProductivity = () => {
    return teamMembers.map(member => {
      const memberTasks = tasks.filter(t => t.assigned_to === member.user_id);
      const completed = memberTasks.filter(t => t.status === 'completed').length;
      const total = memberTasks.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        name: member.name,
        total,
        completed,
        inProgress: memberTasks.filter(t => t.status === 'in_progress').length,
        pending: memberTasks.filter(t => t.status === 'pending' || !t.status).length,
        rate
      };
    }).filter(m => m.total > 0).sort((a, b) => b.rate - a.rate);
  };

  const teamProductivity = getTeamProductivity();

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressTasks}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueTasks}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Overall Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{completionRate}%</span>
              <Badge variant={completionRate >= 70 ? "default" : completionRate >= 40 ? "secondary" : "destructive"}>
                {completionRate >= 70 ? "Excellent" : completionRate >= 40 ? "Good" : "Needs Attention"}
              </Badge>
            </div>
            <Progress value={completionRate} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completedTasks} completed</span>
              <span>{pendingTasks} pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Breakdown */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Task Priority Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-500/10 rounded-lg">
              <p className="text-2xl font-bold text-red-500">{highPriorityTasks}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-2xl font-bold text-yellow-500">
                {tasks.filter(t => t.priority === 'medium').length}
              </p>
              <p className="text-sm text-muted-foreground">Medium Priority</p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <p className="text-2xl font-bold text-blue-500">
                {tasks.filter(t => t.priority === 'low' || !t.priority).length}
              </p>
              <p className="text-sm text-muted-foreground">Low Priority</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Productivity */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Productivity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamProductivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No tasks assigned to team members yet</p>
          ) : (
            <div className="space-y-4">
              {teamProductivity.map((member, index) => (
                <div key={member.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {index === 0 && member.rate > 0 && (
                        <Award className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {member.completed}/{member.total} tasks
                      </Badge>
                      <span className="text-sm font-semibold">{member.rate}%</span>
                    </div>
                  </div>
                  <Progress value={member.rate} className="h-2" />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="text-green-500">✓ {member.completed} done</span>
                    <span className="text-yellow-500">⏳ {member.inProgress} in progress</span>
                    <span className="text-muted-foreground">○ {member.pending} pending</span>
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
