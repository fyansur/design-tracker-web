import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { CreateGoalDialog } from "./create-goal-dialog";
import { CreateDailyGoalDialog } from "./create-daily-goal-dialog";
import { Pin, Calendar, Trash2, Globe, Store as StoreIcon, User, Plus, Clock, CircleCheck, Pencil } from "lucide-react";
import type { Store, Owner, DashboardData, Activity } from "@/types";

const SCOPE_ICON = { GLOBAL: Globe, STORE: StoreIcon, OWNER: User } as const;

const EVENT_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  created: { icon: Plus, color: "text-blue-500 bg-blue-500/10", label: "New design added" },
  completed: { icon: CircleCheck, color: "text-green-500 bg-green-500/10", label: "Design completed 🎉" },
  pending: { icon: Clock, color: "text-yellow-500 bg-yellow-500/10", label: "Marked as pending" },
  updated: { icon: Pencil, color: "text-muted-foreground bg-muted", label: "Design updated" },
  deleted: { icon: Trash2, color: "text-red-500 bg-red-500/10", label: "Design deleted" },
};

function getActivityConfig(a: Activity) {
  return EVENT_CONFIG[a.event] ?? { icon: Pencil, color: "text-muted-foreground bg-muted", label: a.event };
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CircularProgress({ percent }: { percent: number }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative h-10 w-10 shrink-0">
      <svg viewBox="0 0 40 40" className="h-10 w-10 -rotate-90">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="var(--muted)" strokeWidth="3.5" />
        <circle
          cx="20" cy="20" r={radius} fill="none"
          stroke="var(--chart-2)" strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium">{percent}%</span>
    </div>
  );
}

export function ProgressAside() {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [targetDrafts, setTargetDrafts] = useState<Record<number, string>>({});

  async function load() {
    const res = await api.get<DashboardData>("/dashboard?period=week");
    setData(res.data);
  }

  useEffect(() => {
    load();
    api.get<Store[]>("/stores").then((res) => setStores(res.data));
    api.get<Owner[]>("/owners").then((res) => setOwners(res.data));
  }, []);

  async function handleUpdateDailyGoalTarget(dailyGoalId: number, currentTarget: number | null) {
    const draft = targetDrafts[dailyGoalId];
    const value = Number(draft);
    if (!draft || !value || value === currentTarget) return;
    await api.put(`/daily-goals/${dailyGoalId}/target`, { targetCount: value });
    load();
  }
  async function handleDeleteDailyGoal(dailyGoalId: number) {
    await api.delete(`/daily-goals/${dailyGoalId}`);
    load();
  }
  async function handleTogglePinGoal(goalId: number) {
    await api.put(`/goals/${goalId}/pin`);
    load();
  }
  async function handleDeleteGoal(goalId: number) {
    await api.delete(`/goals/${goalId}`);
    load();
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Quick Stats */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Quick Stats (7 hari)</span>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border px-3 py-2">
            <p className="text-xs text-muted-foreground">Total Ide</p>
            <p className="text-lg font-bold text-foreground">{data.totalIdeas}</p>
          </div>
          <div className="rounded-lg border px-3 py-2">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg font-bold text-foreground">{data.completedCount}</p>
          </div>
        </div>
      </div>

      {/* Daily Goals */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Daily Goals</span>
          <CreateDailyGoalDialog stores={stores} owners={owners} onCreated={load} />
        </div>
        <div className="flex flex-col gap-3">
          {data.dailyGoalStats.length === 0 && (
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon"><Clock /></EmptyMedia>
                <EmptyTitle className="text-sm">Belum ada daily goal</EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}
          {data.dailyGoalStats.map((s) => {
            const Icon = SCOPE_ICON[s.scope as keyof typeof SCOPE_ICON] ?? Globe;
            const isAchievedToday = s.targetCount !== null && s.achievedToday >= s.targetCount;
            return (
              <div key={s.dailyGoalId} className="flex flex-col border rounded-lg">
                <div className="flex items-center justify-between gap-2 rounded-t-lg bg-card px-3 py-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-xs truncate">{s.displayName}</span>
                    {isAchievedToday && <Badge className="bg-chart-2 text-white text-[10px] px-1.5">✓</Badge>}
                  </div>
                  <div className="flex items-center rounded-md ring ring-foreground/10 shrink-0">
                    <div className="h-7 w-8 text-xs flex items-center justify-center">{s.achievedToday}</div>
                    <div className="h-7 w-5 text-xs flex items-center justify-center border-x">/</div>
                    <InputGroup className="h-7 w-9 rounded-none! ring-0! outline-0! border-0! rounded-r-md! bg-background!">
                      <InputGroupInput
                        min={1}
                        value={targetDrafts[s.dailyGoalId] ?? String(s.targetCount ?? "")}
                        onChange={(e) => setTargetDrafts((prev) => ({ ...prev, [s.dailyGoalId]: e.target.value }))}
                        onBlur={() => handleUpdateDailyGoalTarget(s.dailyGoalId, s.targetCount)}
                        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                        className="text-center text-xs"
                      />
                    </InputGroup>
                  </div>
                </div>
                <div className="text-[11px] flex items-center justify-between px-3 py-1.5">
                  <p className="text-muted-foreground">{s.achievedDays}/{s.totalDays} days</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteDailyGoal(s.dailyGoalId)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Goals</span>
          <CreateGoalDialog stores={stores} owners={owners} onCreated={load} />
        </div>
        <div className="flex flex-col gap-3">
          {data.goals.length === 0 && (
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon"><Pin /></EmptyMedia>
                <EmptyTitle className="text-sm">Belum ada goal aktif</EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}
          {[...data.goals]
            .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
            .map((g) => {
              const percent = g.targetCount > 0 ? Math.round((g.completedCount / g.targetCount) * 100) : 0;
              return (
                <div key={g.id} className="flex flex-col border rounded-lg">
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {g.store ? (
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: g.store.color }} />
                      ) : g.scope === "OWNER" ? (
                        <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium truncate">{g.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleTogglePinGoal(g.id)}>
                      <Pin className={`h-3.5 w-3.5 ${g.isPinned ? "fill-current text-chart-2" : "text-muted-foreground"}`} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 border-y bg-card px-3 py-2">
                    <CircularProgress percent={percent} />
                    <span className="text-xs font-medium">{g.completedCount} / {g.targetCount}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {g.deadline
                        ? new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "2-digit" })
                        : "No deadline"}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteGoal(g.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Recent Activity</span>
        {data.recentActivities.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Clock /></EmptyMedia>
              <EmptyTitle className="text-sm">Belum ada aktivitas</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {data.recentActivities.map((a) => {
              const config = getActivityConfig(a);
              const Icon = config.icon;
              const itemName = a.properties?.itemName ?? "Untitled";
              return (
                <div key={a.id} className="flex items-start gap-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">{itemName}</span>
                    <span className="text-xs text-muted-foreground">{config.label}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(a.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}