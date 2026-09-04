import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { CircleCheck, Trash2, Pin, Globe, Store, User, Calendar } from "lucide-react";
import { CircularProgress } from "@/lib/dashboard-shared";
import { SimpleCarousel } from "@/components/simple-carousel";
import type { Goal } from "@/types";

export function CampaignsList({
  goals,
  onTogglePin,
  onDelete,
  layout = "list",
  compact = false,
}: {
  goals: Goal[];
  onTogglePin: (goalId: number) => void;
  onDelete: (goalId: number) => void;
  layout?: "list" | "carousel";
  compact?: boolean;
}) {
  if (goals.length === 0) {
    return (
      <div className="flex flex-col bg-card p-6 px-6 rounded-xl h-50">
        <Empty className="py-6 border border-dashed">
          <EmptyHeader>
            <EmptyMedia className="text-sm" variant="icon"><Pin /></EmptyMedia>
            <EmptyTitle className="text-sm">No active campaigns yet</EmptyTitle>
            <EmptyDescription className="text-sm">Create a campaign to get started.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const sorted = [...goals].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  if (compact) {
    return (
      <div className="flex flex-col bg-card p-3 px-6 rounded-xl">
        {sorted.map((g) => {
          const percent = g.targetCount > 0 ? Math.round((g.completedCount / g.targetCount) * 100) : 0;
          const ScopeIcon = g.scope === "STORE" ? Store : g.scope === "OWNER" ? User : Globe;
          return (
            <div key={g.id} className="flex items-center justify-between gap-2 py-1.5 text-sm border-b last:border-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <ScopeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{g.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={percent >= 100 ? "font-medium text-chart-2" : "text-muted-foreground"}>
                  {g.completedCount}/{g.targetCount}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onTogglePin(g.id)}>
                  <Pin className={`h-3 w-3 ${g.isPinned ? "fill-current text-chart-2" : "text-muted-foreground"}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(g.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const cards = sorted.map((g) => {
    const percent = g.targetCount > 0 ? Math.round((g.completedCount / g.targetCount) * 100) : 0;
    const remaining = Math.max(g.targetCount - g.completedCount, 0);
    const daysElapsed = Math.max(1, Math.floor((Date.now() - new Date(g.createdAt).getTime()) / 86400000));
    const actualPace = g.completedCount / daysElapsed;
    let daysLeft: number | null = null;
    if (g.deadline) {
      daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
    }
    const scopeLabel = `${g.scope} CAMPAIGN`;
    const ScopeIcon = g.scope === "STORE" ? Store : g.scope === "OWNER" ? User : Globe;

    return (
      <div key={g.id} className="relative flex flex-col gap-4 overflow-hidden rounded-xl border p-6 bg-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <ScopeIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-semibold tracking-wide text-chart-2">{scopeLabel}</span>
              <span className="text-sm font-semibold truncate">{g.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {percent >= 100 && (
              <div className="flex items-center gap-2 min-w-0 bg-chart-2/30 p-1.5 px-3 text-chart-2 rounded-lg text-xs">
                <CircleCheck className="h-4 w-4" />Success
              </div>
            )}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onTogglePin(g.id)}>
              <Pin className={`h-4 w-4 ${g.isPinned ? "fill-current text-chart-2" : "text-muted-foreground"}`} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onDelete(g.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border bg-background p-4">
          <CircularProgress percent={percent} />
          <div className="flex flex-1 flex-col gap-1.5 min-w-0">
            <span className="text-sm">
              <span className="text-xl font-bold text-chart-2 leading-none">{g.completedCount}</span>
              <span className="text-muted-foreground"> / {g.targetCount} designs</span>
            </span>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div className="h-1.5 rounded-full bg-chart-2" style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/50">{remaining} remaining</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
            {g.deadline ? (
              <>
                Due {new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {daysLeft !== null && <> · {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? "Due today" : "Overdue"}</>}
              </>
            ) : (
              "Lifetime"
            )}
          </div>
          <Badge variant="secondary" className="font-normal text-muted-foreground">{actualPace.toFixed(1)} designs/day</Badge>
        </div>
      </div>
    );
  });

  if (layout === "carousel") {
    return <SimpleCarousel items={cards} />;
  }

  return <div className="flex flex-col gap-4">{cards}</div>;
}