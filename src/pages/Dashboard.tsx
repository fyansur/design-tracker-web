import { useEffect, useState } from "react";
import api from "../lib/api";
import type { DashboardData, Activity } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck, Palette, Store, UserStar, User, Globe, Trash2, Pin, Calendar, Plus, Pencil, Clock, SoapDispenserDroplet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, ArchiveRestore } from "lucide-react";
import { SimpleCarousel } from "@/components/simple-carousel";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

const SCOPE_ICON = { GLOBAL: Globe, STORE: Store, OWNER: User } as const;

const STATUS_COLOR = {
  achieved: "bg-blue-500",
  missed: "bg-muted-foreground/40",
  "no-target": "bg-muted-foreground/40",
} as const;

const STATUS_LABEL = {
  achieved: "tercapai",
  missed: "belum tercapai",
  "no-target": "belum ada target di tanggal ini",
} as const;

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
    case "created":
      return <>You added a new {subjectLabel} called {bold}.</>;
    case "completed":
      return <>You marked {bold} as complete.</>;
    case "pending":
      return <>You moved {bold} back to pending.</>;
    case "updated":
      return <>You updated the {subjectLabel} {bold}.</>;
    case "deleted":
      return <>You deleted the {subjectLabel} {bold}.</>;
    case "recovered":
      return <>You restored the {subjectLabel} {bold} from the trash.</>;
    default:
      return a.description;
  }
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} completed designs</p>
    </div>
  );
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

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-muted-foreground">New</span>;
  const isUp = pct >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-1 text-xs ${isUp ? "text-green-500" : "text-red-500"}`}>
      <Icon className="h-3.5 w-3.5" />
      {isUp ? "+" : ""}{pct}%
    </span>
  );
}


function CircularProgress({ percent }: { percent: number }) {
  const radius = 34; // sebelumnya 26
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative h-20 w-20 shrink-0"> {/* sebelumnya h-16 w-16 */}
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90"> {/* sebelumnya viewBox 0 0 64 64, h-16 w-16 */}
        <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--muted)" strokeWidth="6" /> {/* cx/cy ikut naik jadi setengah dari viewBox */}
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke="var(--chart-2)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-base font-bold">{percent}%</span>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [targetDrafts, setTargetDrafts] = useState<Record<number, string>>({});

  async function fetchData() {
    // Dashboard gak punya period selector lagi — pakai "week" tetap
    // (dipakai buat achievedDays/totalDays di Daily Goal card)
    const res = await api.get<DashboardData>(`/dashboard?period=week`);
    setData(res.data);
  }
  const [yearChartData, setYearChartData] = useState<{ label: string; completed: number }[]>([]);

  useEffect(() => {
    api.get<{ chartData: typeof yearChartData }>("/analytics?period=year")
      .then((res) => setYearChartData(res.data.chartData));
  }, []);
  useEffect(() => {
    fetchData();
  }, []);

  async function handleUpdateDailyGoalTarget(dailyGoalId: number, currentTarget: number | null) {
    const draft = targetDrafts[dailyGoalId];
    const value = Number(draft);
    if (!draft || !value || value === currentTarget) return;
    await api.put(`/daily-goals/${dailyGoalId}/target`, { targetCount: value });
    fetchData();
  }
  async function handleDeleteDailyGoal(dailyGoalId: number) {
    await api.delete(`/daily-goals/${dailyGoalId}`);
    fetchData();
  }
  async function handleTogglePinGoal(goalId: number) {
    await api.put(`/goals/${goalId}/pin`);
    fetchData();
  }
  async function handleDeleteGoal(goalId: number) {
    await api.delete(`/goals/${goalId}`);
    fetchData();
  }

  if (!data) return <p>Loading...</p>;

  const dailyGoalItems = data.dailyGoalStats.map((s) => {
    const scopeLabel = s.scope === "STORE" ? "Store Daily" : s.scope === "OWNER" ? "Owner Daily" : "Global Daily";
    const ScopeIcon = s.scope === "STORE" ? Store : s.scope === "OWNER" ? User : Globe;
    const isAchievedToday = s.targetCount !== null && s.achievedToday >= s.targetCount;
    return (
      <div key={s.dailyGoalId} className="flex w-full shrink-0 flex-col border rounded-lg bg-background">
        <div className="flex items-center justify-between gap-3 rounded-t-lg bg-card px-6 py-2">

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 min-w-0 bg-chart-2/30 p-1.5 px-3 text-chart-2 rounded-lg">
              <ScopeIcon className="h-4 w-4" />
              <span className="text-xs font-medium truncate">{scopeLabel}</span>
            </div>
            {s.scope !== "GLOBAL" && (
              <div
                style={{
                  backgroundColor: s.scope === "STORE" ? `color-mix(in srgb, ${s.store?.color} 30%, transparent)` : undefined,
                  color: s.scope === "STORE" ? s.store?.color : undefined,
                }}
                className={`text-xs flex items-center gap-2 min-w-0 p-1.5 px-3 rounded-lg ${s.scope === "OWNER" ? "bg-cyan-500/10 text-cyan-500" : ""
                  }`}
              >
                {s.displayName}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">

            {isAchievedToday &&
              <div className="flex items-center gap-2 min-w-0 bg-chart-2/30 p-1.5 px-3 text-chart-2 rounded-lg text-xs"><CircleCheck className="h-4 w-4" />Complete
              </div>}
          </div>
        </div>
        <div className="text-xs flex items-center justify-between p-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center rounded-md ring ring-foreground/10">
              <div className="h-8 w-12 text-sm flex items-center px-2.5 py-1 justify-center rounded-l-md font-black">{s.achievedToday}</div>
              <div className="h-8 w-8 text-sm flex items-center px-2.5 py-1 justify-center border-x bg-card">/</div>
              <InputGroup className="h-8 w-12 rounded-none! ring-0! outline-0! border-0! rounded-r-md! bg-background!">
                <InputGroupInput
                  min={1}
                  value={targetDrafts[s.dailyGoalId] ?? String(s.targetCount ?? "")}
                  onChange={(e) => setTargetDrafts((prev) => ({ ...prev, [s.dailyGoalId]: e.target.value }))}
                  onBlur={() => handleUpdateDailyGoalTarget(s.dailyGoalId, s.targetCount)}
                  onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                  className="text-center font-black"
                />
              </InputGroup>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteDailyGoal(s.dailyGoalId)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  });

  const campaignItems = [...data.goals]
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
    .map((g) => {
      const percent = g.targetCount > 0 ? Math.round((g.completedCount / g.targetCount) * 100) : 0;
      const remaining = Math.max(g.targetCount - g.completedCount, 0);

      const daysElapsed = Math.max(1, Math.floor((Date.now() - new Date(g.createdAt).getTime()) / 86400000));
      const actualPace = g.completedCount / daysElapsed;

      let daysLeft: number | null = null;
      let onTrack: boolean | null = null;
      if (g.deadline) {
        daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
        if (remaining <= 0) onTrack = true;
        else if (daysLeft <= 0) onTrack = false;
        else onTrack = actualPace >= remaining / daysLeft;
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
                <div className="flex items-center gap-2 min-w-0 bg-chart-2/30 p-1.5 px-3 text-chart-2 rounded-lg text-xs"><CircleCheck className="h-4 w-4" />Success
                </div>
              )}
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleTogglePinGoal(g.id)}>
                <Pin className={`h-4 w-4 ${g.isPinned ? "fill-current text-chart-2" : "text-muted-foreground"}`} />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDeleteGoal(g.id)}>
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-chart-2">
        <div className="flex flex-col gap-4 md:gap-6">

          {/* Activity Blocks — full width */}
          <div className="hidden md:block">
            <div className="flex scrollbar-none -ml-2 -mr-2">
              {data.activityBlocks.map((b) => {
                const dateNum = new Date(b.date).getDate();
                return (
                  <div key={b.date} className="flex h-24 w-1/15 shrink-0 flex-col items-center justify-center rounded-lg px-2">
                    <div className={`bg-card relative h-full w-full rounded-lg ${b.isToday ? "ring ring-foreground/50" : "ring ring-foreground/10"} mx-1 flex items-center justify-center`}>
                      <span className={`absolute top-2 left-2 text-xs ${b.isToday ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                        {dateNum}
                      </span>
                      <span className={`text-2xl font-semibold ${b.isToday ? "text-foreground" : "text-muted-foreground"}`}>{b.count}</span>
                      {b.dailyGoalStatuses.length > 0 && (
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {b.dailyGoalStatuses.map((s) => (
                            <span
                              key={s.dailyGoalId}
                              title={`${s.displayName}: ${STATUS_LABEL[s.status]}`}
                              className={`h-2 w-2 rounded-full ${STATUS_COLOR[s.status]}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2 KOLOM INDEPENDEN */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">

            {/* ==== KOLOM KIRI ==== */}
            <div className="col-span-2 flex flex-col gap-4 md:gap-6">
              {/* 4 stat cards */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                <Card>
                  <CardContent>
                    <div className="grid grid-cols-12 justify-between">
                      <div className="col-span-10 flex flex-col justify-between gap-2">
                        <span className="text-muted-foreground text-base leading-none">Ideas</span>
                        <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                          {data.today.designs}
                          <ChangeBadge pct={data.today.designsChangePct} />
                        </span>
                      </div>
                      <div className="col-span-2 justify-self-end">
                        <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                          <Palette />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="grid grid-cols-12 justify-between">
                      <div className="col-span-10 flex flex-col justify-between gap-2">
                        <span className="text-muted-foreground text-base leading-none">Designs</span>
                        <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                          {data.today.completedDesigns}
                          <ChangeBadge pct={data.today.completedChangePct} />
                        </span>
                      </div>
                      <div className="col-span-2 justify-self-end">
                        <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                          <CircleCheck />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="grid grid-cols-12 justify-between">
                      <div className="col-span-10 flex flex-col justify-between gap-2">
                        <span className="text-muted-foreground text-base leading-none">Stores</span>
                        <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">{data.totals.stores}</span>
                      </div>
                      <div className="col-span-2 justify-self-end">
                        <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                          <Store />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="grid grid-cols-12 justify-between">
                      <div className="col-span-10 flex flex-col justify-between gap-2">
                        <span className="text-muted-foreground text-base leading-none">Owners</span>
                        <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">{data.totals.owners}</span>
                      </div>
                      <div className="col-span-2 justify-self-end">
                        <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                          <UserStar />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>Completed designs throughout the year.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={yearChartData}>
                      <defs>
                        <linearGradient id="fillDashboardYear" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={1} />
                          <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="label" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="completed" stroke="var(--chart-2)" strokeWidth={2} fill="url(#fillDashboardYear)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie chart */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Designs Distribution</CardTitle>
                  <CardDescription>Distribution of completed designs across stores.</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.ranking.length === 0 || data.completedCount === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada data.</p>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="relative h-40 w-40 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.ranking}
                              dataKey="completedCount"
                              nameKey="name"
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={2}
                              stroke="none"
                            >
                              {data.ranking.map((r) => (
                                <Cell key={r.storeId} fill={r.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--popover)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                fontSize: "12px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-foreground">{data.completedCount}</span>
                          <span className="text-xs text-muted-foreground">Designs</span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 min-w-0">
                        {data.ranking.map((r) => {
                          const pct = Math.round((r.completedCount / data.completedCount) * 100);
                          return (
                            <div key={r.storeId} className="flex items-center justify-between gap-2 text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
                                <span className="truncate">{r.name}</span>
                              </div>
                              <span className="font-medium">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ==== KOLOM KANAN ==== */}
            <div className="flex flex-col gap-4 md:gap-6">
              {dailyGoalItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada daily goal.</p>
              ) : (
                <SimpleCarousel items={dailyGoalItems} />
              )}
              {campaignItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada campaign aktif.</p>
              ) : (
                <SimpleCarousel items={campaignItems} />
              )}

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest activities in your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recentActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="flex flex-col gap-4 pr-3">
                        {data.recentActivities.map((a) => {
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
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}