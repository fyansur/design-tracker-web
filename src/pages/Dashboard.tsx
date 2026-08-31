import { useEffect, useState } from "react";
import api from "../lib/api";
import type { DashboardData } from "../types";
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
    // ganti "load()" di bawah ini sama nama function fetch data Dashboard lo yang sebeneranya
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

  useEffect(() => {
    fetchData();
  }, [period]);

  if (!data) return <p>Loading...</p>;
  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-fade [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-sidebar">
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-6">

            <Card className="md:col-span-3">
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-muted-foreground text-base">
                      Ideas
                    </span>
                    <span className="text-primary text-2xl font-bold">
                      {data.today.designs}
                    </span>
                  </div>
                  <div className="col-span-2 justify-self-end">
                    <div className="w-16 h-16 items-center justify-center flex bg-chart-2 text-background dark:text-foreground rounded-lg">
                      <Palette />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-muted-foreground text-base">
                      Designs
                    </span>
                    <span className="text-primary text-2xl font-bold">
                      {data.today.completedDesigns}
                    </span>
                  </div>
                  <div className="col-span-2 justify-self-end">
                    <div className="w-16 h-16 items-center justify-center flex bg-chart-2 text-background dark:text-foreground rounded-lg">
                      <CircleCheck />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-muted-foreground text-base">
                      Stores
                    </span>
                    <span className="text-primary text-2xl font-bold">
                      {data.totals.stores}
                    </span>
                  </div>
                  <div className="col-span-2 justify-self-end">
                    <div className="w-16 h-16 items-center justify-center flex bg-chart-2 text-background dark:text-foreground rounded-lg">
                      <Store />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-muted-foreground text-base">
                      Owners
                    </span>
                    <span className="text-primary text-2xl font-bold">
                      {data.totals.owners}
                    </span>
                  </div>
                  <div className="col-span-2 justify-self-end">
                    <div className="w-16 h-16 items-center justify-center flex bg-chart-2 text-background dark:text-foreground rounded-lg">
                      <UserStar />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="md:col-span-12" />

            <div className="md:col-span-8 flex flex-col gap-6 md:gap-6">
              <div className="flex flex-row items-center justify-between gap-2">
                <span className="flex-3 text-lg font-semibold text-foreground">Overview</span>
                <Tabs className="flex-1" defaultValue="week" value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                  <TabsList className="w-full">
                    <TabsTrigger className="w-1/3" value="week">7d</TabsTrigger>
                    <TabsTrigger className="w-1/3" value="month">30d</TabsTrigger>
                    <TabsTrigger className="w-1/3" value="year">1y</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex flex-row md:gap-6">
                <Card className="flex-1">
                  <CardContent>
                    <div className="grid grid-cols-12 justify-between ">
                      <div className="col-span-10 flex flex-col justify-between gap-2">
                        <span className="text-muted-foreground text-base">
                          Ideas
                        </span>
                        <span className="text-primary text-2xl font-bold">
                          {data.totalIdeas}
                        </span>
                      </div>
                      <div className="col-span-2 justify-self-end">
                        <div className="w-16 h-16 items-center justify-center flex bg-chart-2 text-background dark:text-foreground rounded-lg">
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
                        <span className="text-muted-foreground text-base">
                          Designs
                        </span>
                        <span className="text-primary text-2xl font-bold">
                          {data.completedCount}
                        </span>
                      </div>
                      <div className="col-span-2 justify-self-end">
                        <div className="w-16 h-16 items-center justify-center flex bg-chart-2 text-background dark:text-foreground rounded-lg">
                          <CircleCheck />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card className="col-span-8 h-fit px-6 pt-10 pb-9">
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
                      <Tooltip content={<ChartTooltip />}
                      />
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
              <div className="grid grid-cols-2 gap-0 md:gap-6">
                <div className="flex flex-col gap-6 md:gap-6">
                  {data.dailyGoalStats.length === 0 && (
                    <p className="text-sm text-muted-foreground">Belum ada daily goal.</p>
                  )}
                  {data.dailyGoalStats.map((s) => {
                    const Icon = SCOPE_ICON[s.scope as keyof typeof SCOPE_ICON] ?? Globe;
                    const isAchievedToday = s.targetCount !== null && s.achievedToday >= s.targetCount;

                    return (
                      <div key={s.dailyGoalId} className="flex flex-col border rounded-lg">
                        <div className={`flex items-center justify-between gap-3 rounded-t-lg bg-card  px-4 py-2`}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{s.displayName}</span>
                            {isAchievedToday && (
                              <Badge className="bg-chart-2 text-white">
                                Complete
                              </Badge>
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
                <div className="flex flex-col gap-6 md:gap-6">
                  {data.goals.length === 0 && (
                    <p className="text-sm text-muted-foreground">Belum ada goal aktif.</p>
                  )}
                  {[...data.goals]
                    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
                    .map((g) => {
                      const percent = g.targetCount > 0 ? Math.round((g.completedCount / g.targetCount) * 100) : 0;
                      return (
                        <div key={g.id} className="flex flex-col border rounded-lg">
                          <div className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              {g.store ? (
                                <span
                                  className="h-4 w-4 shrink-0 rounded-full"
                                  style={{ backgroundColor: g.store.color }}
                                />
                              ) : g.scope === "OWNER" ? (
                                <User className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Globe className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm font-medium truncate">{g.name}</span>
                            </div>
                            <Button
                              variant="ghost" size="icon" className="h-6 w-6"
                              onClick={() => handleTogglePinGoal(g.id)}
                            >
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

            </div>

            <div className="md:col-span-4 flex flex-col  md:gap-6 bg-accent">
            </div>
          </div>

          {/* <>

        <h2>Ranking Store</h2>
        <ol>
          {data.ranking.map((r) => (
            <li key={r.storeId} style={{ color: r.color }}>{r.name} — {r.completedCount}</li>
          ))}
        </ol>

        <h2>Goals Aktif</h2>
        <ul>
          {data.goals.map((g) => (
            <li key={g.id}>{g.name} — {g.completedCount}/{g.targetCount}</li>
          ))}
        </ul>

        <h2>Aktivitas Terbaru</h2>
        <ul>
          {data.recentActivities.map((a) => <li key={a.id}>{a.description}</li>)}
        </ul>
      </> */}

        </div>

        <div className="md:block hidden shrink-0 border-t border-border bg-sidebar p-4">
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
                            title={`${s.displayName}: ${s.achieved ? "tercapai" : "belum tercapai"}`}
                            className={`h-2 w-2 rounded-full ${s.achieved ? "bg-blue-500" : "bg-muted-foreground/40"}`}
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
      </div>
    </>
  );
}