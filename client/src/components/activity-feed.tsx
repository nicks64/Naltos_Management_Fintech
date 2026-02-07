import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ActivityItem {
  id: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: "success" | "critical" | "warning" | "info";
}

interface ActivityData {
  activities: ActivityItem[];
  unreadCount: number;
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

const severityColors: Record<ActivityItem["severity"], string> = {
  success: "bg-green-500",
  critical: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
};

export function ActivityFeed() {
  const { data } = useQuery<ActivityData>({
    queryKey: ["/api/activity"],
  });

  const markReadMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/activity/read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });

  const activities = data?.activities ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-activity-bell"
          aria-label="Activity feed"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px] no-default-hover-elevate no-default-active-elevate"
              data-testid="badge-unread-count"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0"
        align="end"
        data-testid="activity-feed-panel"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Activity</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markReadMutation.mutate()}
              disabled={markReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div>
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 ${
                    !activity.read ? "bg-muted/30" : ""
                  }`}
                  data-testid={`activity-item-${activity.id}`}
                >
                  <div
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${severityColors[activity.severity]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" data-testid={`activity-title-${activity.id}`}>
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`activity-desc-${activity.id}`}>
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" data-testid={`activity-time-${activity.id}`}>
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
