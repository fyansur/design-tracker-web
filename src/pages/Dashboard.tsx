import { useEffect, useState } from "react";
import api from "../lib/api";
import type { DashboardData } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodayStatsCards } from "@/components/today-stats-cards";
import { DailyGoalsList } from "@/components/daily-goals-list";
import { CampaignsList } from "@/components/campaigns-list";
import { RecentActivityFeed } from "@/components/recent-activity-feed";

const OWNER_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const STATUS_COLOR = {
  achieved: "bg-blue-500",
  missed: "bg-muted-foreground/40",
  "no-target": "bg-muted-foreground/40",
} as const;

const STATUS_LABEL = {
  achieved: "achieved",
  missed: "not achieved",
  "no-target": "no target set for this date",
} as const;

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} completed designs</p>
    </div>
  );
}

export default function Dashboard() {
  const [distributionTab, setDistributionTab] = useState<"store" | "owner">("store");
  const [data, setData] = useState<DashboardData | null>(null);

  async function fetchData() {
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

  async function handleUpdateDailyGoalTarget(dailyGoalId: number, value: number) {
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
              <TodayStatsCards data={data} />

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
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Designs Distribution</CardTitle>
                  <Tabs value={distributionTab} onValueChange={(v) => v && setDistributionTab(v as typeof distributionTab)}>
                    <TabsList>
                      <TabsTrigger value="store">Store</TabsTrigger>
                      <TabsTrigger value="owner">Owner</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const items =
                      distributionTab === "store"
                        ? data.ranking.map((r) => ({ key: r.storeId, name: r.name, count: r.completedCount, color: r.color }))
                        : data.rankingByOwner.map((o, i) => ({ key: o.ownerId, name: o.name, count: o.completedCount, color: OWNER_COLORS[i % OWNER_COLORS.length] }));

                    if (items.length === 0 || data.completedCount === 0) {
                      return <p className="text-sm text-muted-foreground">No data available.</p>;
                    }

                    return (
                      <div className="flex items-center gap-4">
                        <div className="relative h-40 w-40 shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={items}
                                dataKey="count"
                                nameKey="name"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={2}
                                stroke="none"
                              >
                                {items.map((item) => (
                                  <Cell key={item.key} fill={item.color} />
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
                          {items.map((item) => {
                            const pct = Math.round((item.count / data.completedCount) * 100);
                            return (
                              <div key={item.key} className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                  <span className="truncate">{item.name}</span>
                                </div>
                                <span className="font-medium">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* ==== KOLOM KANAN ==== */}
            <div className="flex flex-col gap-4 md:gap-6">
              <DailyGoalsList
                dailyGoalStats={data.dailyGoalStats}
                onUpdateTarget={handleUpdateDailyGoalTarget}
                onDelete={handleDeleteDailyGoal}
              />
              <CampaignsList
                goals={data.goals}
                onTogglePin={handleTogglePinGoal}
                onDelete={handleDeleteGoal}
                layout="carousel"
              />
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest activities in your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivityFeed activities={data.recentActivities} />
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}