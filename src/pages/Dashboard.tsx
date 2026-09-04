import { useEffect, useState } from "react";
import api from "../lib/api";
import type { DashboardData, Store } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, ResponsiveContainer } from "recharts";
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts";
import { TodayStatsCards } from "@/components/today-stats-cards";
import { DailyGoalsList } from "@/components/daily-goals-list";
import { CampaignsList } from "@/components/campaigns-list";
import { RecentActivityFeed } from "@/components/recent-activity-feed";
import { DesignsDistributionCard } from "@/components/designs-distribution-card";
import { QuickActionsCard } from "@/components/quick-actions-card";
import type { Owner } from "@/types";
import { LoadingScreen } from "@/components/loading-screen";
import { Tooltip as RadixTooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

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
  const [data, setData] = useState<DashboardData | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);

  async function fetchData() {
    const res = await api.get<DashboardData>(`/dashboard?period=week`);
    setData(res.data);
  }

  async function refreshAll() {
    await Promise.all([
      fetchData(),
      api.get<Owner[]>("/owners").then((res) => setOwners(res.data)),
      api.get<Store[]>("/stores").then((res) => setStores(res.data)),
    ]);
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
    toast.success("Daily goal deleted.", {
      action: {
        label: "Undo",
        onClick: async () => {
          await api.post(`/trash/daily-goal/${dailyGoalId}/restore`, {}, { suppressGlobalError: true });
          fetchData();
        },
      },
    });
    fetchData();
  }
  async function handleTogglePinGoal(goalId: number) {
    await api.put(`/goals/${goalId}/pin`);
    fetchData();
  }
  async function handleDeleteGoal(goalId: number) {
    await api.delete(`/goals/${goalId}`);
    toast.success("Campaign deleted.", {
      action: {
        label: "Undo",
        onClick: async () => {
          await api.post(`/trash/goal/${goalId}/restore`, {}, { suppressGlobalError: true });
          fetchData();
        },
      },
    });
    fetchData();
  }

  useEffect(() => {
    api.get<Owner[]>("/owners").then((res) => setOwners(res.data));
    api.get<Store[]>("/stores").then((res) => setStores(res.data));
  }, []);

  if (!data) return <LoadingScreen />;
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
                        <TooltipProvider delay={100}>
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            {b.dailyGoalStatuses.map((s) => (
                              <RadixTooltip key={s.dailyGoalId}>
                                <TooltipTrigger
                                  render={<span className={`h-2 w-2 rounded-full ${STATUS_COLOR[s.status]}`} />}
                                />
                                <TooltipContent className="p-2">
                                  <span className="font-medium">{s.displayName}</span>
                                  <span className="text-muted-foreground"> — {STATUS_LABEL[s.status]}</span>
                                </TooltipContent>
                              </RadixTooltip>
                            ))}
                          </div>
                        </TooltipProvider>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DesignsDistributionCard
                  ranking={data.ranking}
                  rankingByOwner={data.rankingByOwner}
                  completedCount={data.completedCount}
                />
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentActivityFeed activities={data.recentActivities} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ==== KOLOM KANAN ==== */}
            <div className="flex flex-col gap-4 md:gap-6">
              <QuickActionsCard stores={stores} owners={owners} onCreated={refreshAll} />
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
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}