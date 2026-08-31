import { useEffect, useState } from "react";
import api from "../lib/api";
import type { DashboardData } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck, Palette, Store, UserStar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { User, Globe, Trash2 } from "lucide-react";
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

  useEffect(() => {
    fetchData();
  }, [period]);

  if (!data) return <p>Loading...</p>;
  function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
        <p className="font-medium text-popover-foreground">{label}</p>
        <p className="text-muted-foreground">{payload[0].value} completed designs</p>
      </div>
    );
  }
  return (
    <div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="flex scrollbar-none -ml-2 -mr-2">
            {data.activityBlocks.map((b) => {
              const dateNum = new Date(b.date).getDate();

              return (
                <div
                  key={b.date}
                  className="flex h-24 w-1/15 shrink-0 flex-col items-center justify-center rounded-lg px-2"
                >
                  <div className="bg-card relative h-full w-full rounded-lg ring ring-foreground/10 mx-1 flex items-center justify-center">
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

        <Card className="col-span-3">
          <CardContent>
            <div className="grid grid-cols-12 justify-between ">
              <div className="col-span-10 flex flex-col justify-between gap-2">
                <span className="text-primary text-base">
                  Today's Designs
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
        <Card className="col-span-3">
          <CardContent>
            <div className="grid grid-cols-12 justify-between ">
              <div className="col-span-10 flex flex-col justify-between gap-2">
                <span className="text-primary text-base">
                  Today's Completed Designs
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
        <Card className="col-span-3">
          <CardContent>
            <div className="grid grid-cols-12 justify-between ">
              <div className="col-span-10 flex flex-col justify-between gap-2">
                <span className="text-primary text-base">
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
        <Card className="col-span-3">
          <CardContent>
            <div className="grid grid-cols-12 justify-between ">
              <div className="col-span-10 flex flex-col justify-between gap-2">
                <span className="text-primary text-base">
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
        <Separator className="col-span-12" />
        <div className="col-span-4 flex flex-col gap-4">
          <Card>
            <CardContent>
              <Tabs defaultValue="week" value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                <TabsList className="w-full">
                  <TabsTrigger value="week">7 Days</TabsTrigger>
                  <TabsTrigger value="month">30 Days</TabsTrigger>
                  <TabsTrigger value="year">12 Months</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          <div className="flex flex-row gap-4">
            <Card>
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-primary text-base">
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
            <Card>
              <CardContent>
                <div className="grid grid-cols-12 justify-between ">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-primary text-base">
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
          {data.dailyGoalStats.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada daily goal.</p>
          )}
          {data.dailyGoalStats.map((s) => {
            const Icon = SCOPE_ICON[s.scope as keyof typeof SCOPE_ICON] ?? Globe;
            return (
              <div key={s.dailyGoalId} className="flex flex-col border rounded-lg">
                <div className="flex items-center justify-between gap-3 rounded-t-lg bg-card px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{s.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-xl ring ring-foreground/10">
                      <div className="h-8 w-16 text-sm flex items-center px-2.5 py-1 justify-end bg-background rounded-l-xl">{s.achievedToday}</div>
                      <div className="h-8 w-8 text-sm flex items-center px-2.5 py-1 justify-center font-black">/</div>

                      <InputGroup
                        className="h-8 w-16 rounded-none! ring-0! outline-0! border-0! rounded-r-xl! bg-background!">
                        <InputGroupInput
                          min={1}
                          value={targetDrafts[s.dailyGoalId] ?? String(s.targetCount ?? "")}
                          onChange={(e) => setTargetDrafts((prev) => ({ ...prev, [s.dailyGoalId]: e.target.value }))}
                          onBlur={() => handleUpdateDailyGoalTarget(s.dailyGoalId, s.targetCount)}
                          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
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
        <Card className="col-span-8">
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
                <YAxis allowDecimals={false} fontSize={12} axisLine={false} tickLine={false} />
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
      </div>
      <>

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
      </>
    </div>
  );
}