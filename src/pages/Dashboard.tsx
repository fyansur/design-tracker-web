import { useEffect, useState } from "react";
import api from "../lib/api";
import type { DashboardData, Activity } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck, Palette, Store, UserStar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { User, Globe, Trash2, Pin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Clock } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const SCOPE_ICON = { GLOBAL: Globe, STORE: Store, OWNER: User } as const;
  const [targetDrafts, setTargetDrafts] = useState<Record<number, string>>({});

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
  async function fetchData() {
    const res = await api.get<DashboardData>(`/dashboard?period=${period}`);
    setData(res.data);
  }
  async function handleTogglePinGoal(goalId: number) {
    await api.put(`/goals/${goalId}/pin`);
    fetchData();
  }
  async function handleDeleteGoal(goalId: number) {
    await api.delete(`/goals/${goalId}`);
    fetchData();
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
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <div className="relative h-12 w-12">
        <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
          <circle cx="24" cy="24" r={radius} fill="none" stroke="var(--muted)" strokeWidth="4" />
          <circle
            cx="24" cy="24" r={radius} fill="none"
            stroke="var(--chart-2)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
          {percent}%
        </span>
      </div>
    );
  }
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

  const SUBJECT_LABEL: Record<string, string> = {
    Store: "store",
    Design: "design",
    Owner: "owner",
    Goal: "goal",
    DailyGoal: "daily goal",
  };

  const EVENT_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    created: { icon: Plus, color: "text-blue-500 bg-blue-500/10", label: "New design added" },
    completed: { icon: CircleCheck, color: "text-green-500 bg-green-500/10", label: "Design completed" },
    pending: { icon: Clock, color: "text-yellow-500 bg-yellow-500/10", label: "Marked as pending" },
    updated: { icon: Pencil, color: "text-muted-foreground bg-muted", label: "Design updated" },
    deleted: { icon: Trash2, color: "text-red-500 bg-red-500/10", label: "Design deleted" },
  };

  function getActivityConfig(a: Activity) {
    return EVENT_CONFIG[a.event] ?? { icon: Pencil, color: "text-muted-foreground bg-muted", label: a.event };
  }
  useEffect(() => {
    fetchData();
  }, [period]);

  if (!data) return <p>Loading...</p>;
  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-sidebar">

          <div className="space-y-4 md:space-y-0 flex flex-col md:grid md:grid-cols-8 md:gap-6">
            <div className="hidden md:block col-span-8">
              <div className="flex scrollbar-none -ml-2 -mr-2">
                {data.activityBlocks.map((b) => {
                  const dateNum = new Date(b.date).getDate();

                  return (
                    <div
                      key={b.date}
                      className="flex h-24 w-1/15 shrink-0 flex-col items-center justify-center rounded-lg px-2"
                    >
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
            <span className="col-span-8 flex-3 text-lg font-semibold text-foreground leading-none">Today</span>
            <Card className="md:col-span-2">
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-muted-foreground text-base">Ideas</span>
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
            <Card className="md:col-span-2">
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-muted-foreground text-base">Designs</span>
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
            <Card className="md:col-span-2">
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-muted-foreground text-base">Stores</span>
                    <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                      {data.totals.stores}
                    </span>
                  </div>
                  <div className="col-span-2 justify-self-end">
                    <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                      <Store />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-muted-foreground text-base">Owners</span>
                    <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                      {data.totals.owners}
                    </span>
                  </div>
                  <div className="col-span-2 justify-self-end">
                    <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                      <UserStar />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Goals (kiri) + Goals (kanan), sejajar */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <span className="text-lg font-semibold text-foreground">Daily Goals</span>
              <div className="flex flex-col h-72 scroll-fade gap-4 overflow-y-auto pb-2 scrollbar-none">
                {data.dailyGoalStats.length === 0 && (
                  <p className="text-sm text-muted-foreground">Belum ada daily goal.</p>
                )}
                {data.dailyGoalStats.map((s) => {
                  const Icon = SCOPE_ICON[s.scope as keyof typeof SCOPE_ICON] ?? Globe;
                  const isAchievedToday = s.targetCount !== null && s.achievedToday >= s.targetCount;

                  return (
                    <div key={s.dailyGoalId} className="flex w-full shrink-0 flex-col border rounded-lg">
                      <div className={`flex items-center justify-between gap-3 rounded-t-lg bg-card  px-4 py-2`}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{s.displayName}</span>
                          {isAchievedToday && (
                            <Badge className="bg-chart-2 text-white">Complete</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center rounded-md ring ring-foreground/10">
                            <div className="h-8 w-12 text-sm flex items-center px-2.5 py-1 justify-center rounded-l-md">{s.achievedToday}</div>
                            <div className="h-8 w-8 text-sm flex items-center px-2.5 py-1 justify-center border-x">/</div>
                            <InputGroup
                              className="h-8 w-12 rounded-none! ring-0! outline-0! border-0! rounded-r-md! bg-background!">
                              <InputGroupInput
                                min={1}
                                value={targetDrafts[s.dailyGoalId] ?? String(s.targetCount ?? "")}
                                onChange={(e) => setTargetDrafts((prev) => ({ ...prev, [s.dailyGoalId]: e.target.value }))}
                                onBlur={() => handleUpdateDailyGoalTarget(s.dailyGoalId, s.targetCount)}
                                onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                                className="text-center"
                              />
                            </InputGroup>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs flex items-center justify-between p-3">
                        <p className="text-muted-foreground">
                          {s.achievedDays}/{s.totalDays} days achieved
                        </p>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteDailyGoal(s.dailyGoalId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-6">
              <span className="text-lg font-semibold text-foreground">Goals</span>
              <div className="flex flex-col gap-4 h-72 overflow-y-auto scroll-fade pb-2 scrollbar-none">
                {data.goals.length === 0 && (
                  <p className="text-sm text-muted-foreground">Belum ada goal aktif.</p>
                )}
                {[...data.goals]
                  .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
                  .map((g) => {
                    const percent = g.targetCount > 0 ? Math.round((g.completedCount / g.targetCount) * 100) : 0;
                    return (
                      <div key={g.id} className="flex w-full shrink-0 flex-col border rounded-lg">
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {g.store ? (
                              <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: g.store.color }} />
                            ) : g.scope === "OWNER" ? (
                              <User className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium truncate">{g.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleTogglePinGoal(g.id)}>
                            <Pin className={`h-4 w-4 ${g.isPinned ? "fill-current text-chart-2" : "text-muted-foreground"}`} />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3 border-y bg-card px-4 py-3">
                          <CircularProgress percent={percent} />
                          <span className="text-sm font-medium">{g.completedCount} / {g.targetCount}</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {g.deadline
                              ? new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                              : "No deadline"}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteGoal(g.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <Separator className="col-span-8" />
            {/* Overview: Tabs + period stats + Chart, sekarang full width karena Daily Goals/Goals udah gak nempel di sampingnya */}
            <div className="md:col-span-8 flex flex-col gap-6 md:gap-6">
              <div className="flex flex-row items-center justify-between gap-2">
                <span className="flex-3 text-lg font-semibold text-foreground">Overview</span>
                <Tabs className="flex-3 md:flex-1" defaultValue="week" value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                  <TabsList className="w-full">
                    <TabsTrigger className="w-1/3" value="week">7d</TabsTrigger>
                    <TabsTrigger className="w-1/3" value="month">30d</TabsTrigger>
                    <TabsTrigger className="w-1/3" value="year">1y</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex flex-row gap-4 md:gap-6">
                <Card className="flex-1">
                  <CardContent>
                    <div className="grid grid-cols-12 justify-between ">
                      <div className="col-span-10 flex flex-col justify-between gap-2">
                        <span className="text-muted-foreground text-base">Ideas</span>
                        <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                          {data.totalIdeas}
                          <ChangeBadge pct={data.totalIdeasChangePct} />
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
                <Card className="flex-1">
                  <CardContent>
                    <div className="grid grid-cols-12 justify-between ">
                      <div className="col-span-10 flex flex-col justify-between gap-2">
                        <span className="text-muted-foreground text-base">Designs</span>
                        <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                          {data.completedCount}
                          <ChangeBadge pct={data.completedCountChangePct} />
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
              </div>
              <Card className="hidden md:block h-fit px-6 pt-10 pb-9">
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.chartData}>
                      <defs>
                        <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={1} />
                          <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="label" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                        fill="url(#fillCompleted)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-4 flex flex-col gap-6">
              <span className="text-lg font-semibold text-foreground">Designs Distribution</span>
              <Card>
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

            <div className="md:col-span-4 flex flex-col gap-6">
              <span className="text-lg font-semibold text-foreground">Recent Activity</span>
              <Card>
                <CardContent>
                  {data.recentActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="flex flex-col gap-4 pr-3">
                        {data.recentActivities.map((a) => {
                          const config = getActivityConfig(a);
                          const Icon = config.icon;
                          const itemName = a.properties?.itemName ?? "Untitled";
                          return (
                            <div key={a.id} className="flex items-start gap-3">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-sm font-semibold text-foreground truncate">{itemName}</span>
                                <span className="text-sm text-muted-foreground">{config.label}</span>
                                <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
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
    </>
  );
}