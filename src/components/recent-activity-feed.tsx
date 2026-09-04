import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Clock, Pencil } from "lucide-react";
import { EVENT_ICON, EVENT_COLOR, EVENT_DOT_COLOR, getActivityTitle, getActivityDescription, timeAgo } from "@/lib/dashboard-shared";
import type { Activity } from "@/types";

export function RecentActivityFeed({
  activities,
  height = "h-64",
  compact = false,
}: {
  activities: Activity[];
  height?: string;
  compact?: boolean;
}) {
  if (activities.length === 0) {
    if (compact) {
      return (
        <div className="flex flex-col bg-card p-6 px-6 rounded-xl h-50">
          <Empty className="py-6 border border-dashed">
            <EmptyHeader>
              <EmptyMedia className="text-sm" variant="icon"><Clock /></EmptyMedia>
              <EmptyTitle className="text-sm">No recent activity</EmptyTitle>
              <EmptyDescription className="text-sm">No recent activity to display.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      );
    }
    return (
      <Empty className="py-6 border border-dashed">
        <EmptyHeader>
          <EmptyMedia className="text-sm" variant="icon"><Clock /></EmptyMedia>
          <EmptyTitle className="text-sm">No recent activity</EmptyTitle>
          <EmptyDescription className="text-sm">You have no recent activity to display.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (compact) {
    return (
      <ScrollArea className={height}>
        <div className="flex flex-col bg-card p-3 px-6 rounded-xl">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-2 py-1.5 border-b last:border-0">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${EVENT_DOT_COLOR[a.event] ?? "bg-muted-foreground"}`} />
              <div className="flex flex-col min-w-0 text-xs">
                <span className="font-medium text-foreground truncate">{getActivityTitle(a)}</span>
                <span className="text-muted-foreground truncate">{getActivityDescription(a)}</span>
                <span className="text-muted-foreground/50">{timeAgo(a.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className={height}>
      <div className="flex flex-col gap-4 pr-3">
        {activities.map((a) => {
          const Icon = EVENT_ICON[a.event] ?? Pencil;
          const color = EVENT_COLOR[a.event] ?? "text-muted-foreground bg-muted";
          return (
            <div key={a.id} className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-semibold text-foreground truncate leading-none">{getActivityTitle(a)}</span>
                <span className="text-xs text-muted-foreground leading-none">{getActivityDescription(a)}</span>
                <span className="text-xs text-muted-foreground/50">{timeAgo(a.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}