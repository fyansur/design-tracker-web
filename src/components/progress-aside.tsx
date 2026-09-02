import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { CreateGoalDialog } from "./create-goal-dialog";
import { CreateDailyGoalDialog } from "./create-daily-goal-dialog";
import {
  Pin, Calendar, Trash2, Globe, Store as StoreIcon, User, Plus, Clock,
  CircleCheck, Pencil, ArchiveRestore,
} from "lucide-react";
import type { Store, Owner, DashboardData, Activity } from "@/types";

const SCOPE_ICON = { GLOBAL: Globe, STORE: StoreIcon, OWNER: User } as const;

const EVENT_ICON: Record<string, any> = {
  created: Plus,
  completed: CircleCheck,
  pending: Clock,
  updated: Pencil,
  deleted: Trash2,
  recovered: ArchiveRestore,
};

const EVENT_COLOR: Record<string, string> = {
  created: "text-blue-500 bg-blue-500/10",
  completed: "text-green-500 bg-green-500/10",
  pending: "text-yellow-500 bg-yellow-500/10",
  updated: "text-muted-foreground bg-muted",
  deleted: "text-red-500 bg-red-500/10",
  recovered: "text-purple-500 bg-purple-500/10",
};

const SUBJECT_LABEL: Record<string, string> = {
  Design: "idea",
  Store: "store",
  Owner: "owner",
};

function getActivityTitle(a: Activity): string {
  const subjectLabel = SUBJECT_LABEL[a.subjectType] ?? a.subjectType.toLowerCase();
  const capitalized = subjectLabel.charAt(0).toUpperCase() + subjectLabel.slice(1);
  switch (a.event) {
    case "created": return `New ${subjectLabel} added`;
    case "completed": return `${capitalized} completed`;
    case "pending": return `${capitalized} marked as pending`;
    case "updated": return `${capitalized} updated`;
    case "deleted": return `${capitalized} deleted`;
    case "recovered": return `${capitalized} restored`;
    default: return a.event;
  }
}

function getActivityDescription(a: Activity) {
  const name = a.properties?.itemName ?? "Untitled";
  const subjectLabel = SUBJECT_LABEL[a.subjectType] ?? a.subjectType.toLowerCase();
  const bold = <span className="font-semibold text-foreground">{name}</span>;
  switch (a.event) {
    case "created": return <>Added a new {subjectLabel} called {bold}.</>;
    case "completed": return <>Marked {bold} as complete.</>;
    case "pending": return <>Moved {bold} back to pending.</>;
    case "updated": return <>Updated the {subjectLabel} {bold}.</>;
    case "deleted": return <>Deleted the {subjectLabel} {bold}.</>;
    case "recovered": return <>Restored the {subjectLabel} {bold} from trash.</>;
    default: return a.description;
  }
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
            const ScopeIcon = SCOPE_ICON[s.scope as keyof typeof SCOPE_ICON] ?? Globe;
            const isAchievedToday = s.targetCount !== null && s.achievedToday >= s.targetCount;
            const percent = s.targetCount ? Math.min(Math.round((s.achievedToday / s.targetCount) * 100), 100) : 0;
            return (
              <div key={s.dailyGoalId} className="flex flex-col border rounded-lg">
                <div className="flex flex-col gap-1.5 rounded-t-lg bg-card px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 min-w-0 bg-chart-2/30 px-2 py-1 text-chart-2 rounded-md">
                      <ScopeIcon className="h-3 w-3 shrink-0" />
                      <span className="text-[10px] font-medium truncate">{s.scope}</span>
                    </div>
                    {isAchievedToday && <Badge className="bg-chart-2 text-white text-[10px] px-1.5 shrink-0">✓</Badge>}
                  </div>
                  {s.scope !== "GLOBAL" && (
                    <span
                      style={{ color: s.scope === "STORE" ? s.store?.color : undefined }}
                      className={`text-xs font-medium truncate ${s.scope === "OWNER" ? "text-cyan-500" : ""}`}
                    >
                      {s.displayName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 border-y bg-background px-3 py-2">
                  <CircularProgress percent={percent} />
                  <div className="flex items-center rounded-md ring ring-foreground/10">
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

      {/* Campaigns */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Campaigns</span>
          <CreateGoalDialog stores={stores} owners={owners} onCreated={load} />
        </div>
        <div className="flex flex-col gap-3">
          {data.goals.length === 0 && (
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon"><Pin /></EmptyMedia>
                <EmptyTitle className="text-sm">Belum ada campaign aktif</EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}
          {[...data.goals]
            .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
            .map((g) => {
              const percent = g.targetCount > 0 ? Math.round((g.completedCount / g.targetCount) * 100) : 0;
              const ScopeIcon = g.scope === "OWNER" ? User : Globe;
              return (
                <div key={g.id} className="flex flex-col border rounded-lg">
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {g.store ? (
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: g.store.color }} />
                      ) : (
                        <ScopeIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium truncate">{g.name}</span>
                      {percent >= 100 && <Badge className="bg-chart-2 text-white text-[10px] px-1.5 shrink-0">✓</Badge>}
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

      {/* Recent Activity */}
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
              const Icon = EVENT_ICON[a.event] ?? Pencil;
              const color = EVENT_COLOR[a.event] ?? "text-muted-foreground bg-muted";
              return (
                <div key={a.id} className="flex items-start gap-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">{getActivityTitle(a)}</span>
                    <span className="text-xs text-muted-foreground">{getActivityDescription(a)}</span>
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