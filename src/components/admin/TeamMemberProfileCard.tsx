import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Camera,
  Edit,
  Badge,
  ListTodo,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";

export interface TeamMemberProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  department?: string | null;
  designation?: string | null;
  serial_number?: string | null;
  is_core_pillar?: boolean | null;
  profile_image?: string | null;
  status?: string | null;
  hired_at?: string | null;
  last_seen?: string | null;
  salary?: number | null;
  bonus?: number | null;
}

export interface AssignedTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string | null;
}

export interface AssignedProject {
  id: string;
  title: string;
  status: string;
  progress_percentage?: number | null;
}

interface TeamMemberProfileCardProps {
  member: TeamMemberProfile;
  tasks?: AssignedTask[];
  projects?: AssignedProject[];
  canEdit?: boolean;
  onEdit?: () => void;
  onUpdatePhoto?: () => void;
  variant?: "full" | "compact";
}

export function TeamMemberProfileCard({
  member,
  tasks = [],
  projects = [],
  canEdit = false,
  onEdit,
  onUpdatePhoto,
  variant = "full",
}: TeamMemberProfileCardProps) {
  const getOnlineStatus = () => {
    if (!member.last_seen) return { status: "offline", label: "Offline", color: "text-muted-foreground" };
    
    const minutesAgo = differenceInMinutes(new Date(), new Date(member.last_seen));
    
    if (minutesAgo < 5) {
      return { status: "online", label: "Online", color: "text-green-500" };
    } else if (minutesAgo < 30) {
      return { status: "away", label: `Active ${formatDistanceToNow(new Date(member.last_seen), { addSuffix: true })}`, color: "text-yellow-500" };
    } else {
      return { status: "offline", label: `Last seen ${formatDistanceToNow(new Date(member.last_seen), { addSuffix: true })}`, color: "text-muted-foreground" };
    }
  };

  const onlineStatus = getOnlineStatus();

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": case "done": return "bg-green-500/20 text-green-400";
      case "in_progress": case "in progress": return "bg-blue-500/20 text-blue-400";
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-14 h-14 border-2 border-border">
                <AvatarImage src={member.profile_image || undefined} alt={member.name} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                onlineStatus.status === "online" ? "bg-green-500" :
                onlineStatus.status === "away" ? "bg-yellow-500" : "bg-muted-foreground"
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{member.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{member.designation || member.role}</p>
              <p className="text-xs text-muted-foreground">{member.department}</p>
            </div>
            {member.is_core_pillar && (
              <UIBadge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                Core Pillar
              </UIBadge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden border-2 border-border/50 bg-gradient-to-br from-background via-primary/5 to-background">
        {/* Header with ID Badge */}
        <CardHeader className="bg-primary/10 border-b border-primary/20 py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold tracking-wider text-muted-foreground">
                ASIREX EMPLOYEE CARD
              </span>
            </div>
            <span className="text-sm font-mono text-primary">
              {member.serial_number || "N/A"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Main Profile Section */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-lg">
                  <AvatarImage src={member.profile_image || undefined} alt={member.name} />
                  <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                    {member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online Status Indicator */}
                <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-3 border-background shadow-lg ${
                  onlineStatus.status === "online" ? "bg-green-500 animate-pulse" :
                  onlineStatus.status === "away" ? "bg-yellow-500" : "bg-muted-foreground"
                }`} />
                {/* Edit Photo Button */}
                {canEdit && onUpdatePhoto && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onUpdatePhoto}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {/* Online Status Text */}
              <div className={`flex items-center gap-1.5 text-sm ${onlineStatus.color}`}>
                {onlineStatus.status === "online" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span>{onlineStatus.label}</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{member.name}</h2>
                  <p className="text-lg text-primary font-medium">{member.designation || member.role}</p>
                </div>
                {canEdit && onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {member.is_core_pillar && (
                  <UIBadge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Core Pillar
                  </UIBadge>
                )}
                <UIBadge variant="outline" className="capitalize">
                  {member.status || "Active"}
                </UIBadge>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{member.department || "General"}</span>
                </div>
                {member.hired_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">
                      Joined {new Date(member.hired_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Assigned Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Assigned Tasks</h3>
              <UIBadge variant="secondary" className="ml-auto">
                {tasks.length}
              </UIBadge>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === "completed" ? "bg-green-500" :
                        task.status === "in_progress" ? "bg-blue-500" : "bg-yellow-500"
                      }`} />
                      <span className="text-sm font-medium text-foreground">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UIBadge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </UIBadge>
                      <UIBadge variant="outline" className={getStatusColor(task.status)}>
                        {task.status?.replace("_", " ")}
                      </UIBadge>
                    </div>
                  </div>
                ))}
                {tasks.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{tasks.length - 5} more tasks
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks assigned
              </p>
            )}
          </div>

          <Separator className="my-6" />

          {/* Assigned Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Assigned Projects</h3>
              <UIBadge variant="secondary" className="ml-auto">
                {projects.length}
              </UIBadge>
            </div>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {project.title}
                      </span>
                      <UIBadge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </UIBadge>
                    </div>
                    {project.progress_percentage !== null && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${project.progress_percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No projects assigned
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
