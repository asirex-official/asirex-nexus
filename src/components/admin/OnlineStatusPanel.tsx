import { useRealtimeTeamStatus } from "@/hooks/useRealtimeStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Users, Circle, Clock, UserX } from "lucide-react";

export function OnlineStatusPanel() {
  const { teamStatus, isLoading, getOnlineStatus, onlineCount, awayCount, offlineCount } = useRealtimeTeamStatus();

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading team status...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Online Status
          </span>
          <div className="flex items-center gap-3 text-sm font-normal">
            <span className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              {onlineCount}
            </span>
            <span className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />
              {awayCount}
            </span>
            <span className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
              {offlineCount}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {teamStatus.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserX className="h-8 w-8 mx-auto mb-2" />
              <p>No team members found</p>
            </div>
          ) : (
            teamStatus.map((member) => {
              const status = getOnlineStatus(member.last_seen);
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profile_image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${status.color}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.role} {member.department && `• ${member.department}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        status.status === "online"
                          ? "border-green-500/30 text-green-500"
                          : status.status === "away"
                          ? "border-yellow-500/30 text-yellow-500"
                          : "border-muted text-muted-foreground"
                      }`}
                    >
                      {status.status === "online" ? (
                        "Online"
                      ) : status.status === "away" ? (
                        "Away"
                      ) : (
                        "Offline"
                      )}
                    </Badge>
                    {member.last_seen && status.status !== "online" && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(member.last_seen), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
