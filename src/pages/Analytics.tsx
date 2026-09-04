import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { AnalyticsData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Palette, CircleCheck, Tag, User, Store, Pencil, UserStar } from "lucide-react";
import { LoadingScreen } from "@/components/loading-screen";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-muted-foreground">New</span>;
  const isUp = pct >= 0;
  return (
    <span className={`text-xs font-medium ${isUp ? "text-green-500" : "text-red-500"}`}>
      {isUp ? "+" : ""}{pct}%
    </span>
  );
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

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  async function fetchData() {
    const res = await api.get<AnalyticsData>(`/analytics?period=${period}`);
    setData(res.data);
  }

  useEffect(() => {
    fetchData();
  }, [period]);

  if (!data) return <LoadingScreen />;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-chart-2">

        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">Performance</span>
            <Tabs value={period} onValueChange={(v) => v && setPeriod(v as typeof period)}>
              <TabsList className="w-64">
                <TabsTrigger className="w-1/3" value="week">7d</TabsTrigger>
                <TabsTrigger className="w-1/3" value="month">30d</TabsTrigger>
                <TabsTrigger className="w-1/3" value="year">1y</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardContent>
                <div className="grid grid-cols-12 justify-between">
                  <div className="col-span-10 flex flex-col justify-between gap-2">
                    <span className="text-muted-foreground text-base">Ideas</span>
                    <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                      {data.totalIdeas}
                      <ChangeBadge pct={data.totalIdeasChangePct} />
                    </span>
                  </div>
                  <div className="col-span-2 justify-self-end">
                    <div className="w-16 h-16 items-center justify-center flex bg-chart-2/10 text-chart-2 rounded-lg">
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
                    <span className="text-muted-foreground text-base">Designs</span>
                    <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                      {data.completedCount}
                      <ChangeBadge pct={data.completedCountChangePct} />
                    </span>
                  </div>
                  <div className="col-span-2 justify-self-end">
                    <div className="w-16 h-16 items-center justify-center flex bg-chart-2/10 text-chart-2 rounded-lg">
                      <CircleCheck />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit px-6 pt-10 pb-9 shrink-0">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="fillAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={1} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="label" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="completed" stroke="var(--chart-2)" strokeWidth={2} fill="url(#fillAnalytics)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">Top Category
                </CardTitle>
                <CardDescription>Most popular categories based on completed designs.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.topCategories.length === 0 &&
                  <Empty className="py-6 border border-dashed">
                    <EmptyHeader>
                      <EmptyMedia className="text-sm" variant="icon"><Pencil /></EmptyMedia>
                      <EmptyTitle className="text-sm">No data yet</EmptyTitle>
                      <EmptyDescription className="text-sm">Complete some designs to see top categories.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                }
                {data.topCategories.map((c, i) => {
                  const maxCount = data.topCategories[0]?.count ?? 0;
                  const pct = maxCount > 0 ? (c.count / maxCount) * 100 : 0;
                  const rankStyle =
                    i === 0 ? "text-yellow-500 bg-yellow-500/10" :
                      i === 1 ? "text-slate-400 bg-slate-400/10" :
                        i === 2 ? "text-amber-600 bg-amber-600/10" :
                          "text-muted-foreground bg-muted";
                  return (
                    <div key={c.id} className="flex flex-col gap-3 rounded-lg border p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${rankStyle}`}>
                            {i + 1}
                          </span>
                          <span className="text-sm truncate">{c.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{c.count}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted">
                        <div className="h-1 rounded-full bg-chart-2" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">Top Store</CardTitle>
                <CardDescription>Most popular stores based on completed designs.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.topStores.length === 0 &&
                  <Empty className="py-6 border border-dashed">
                    <EmptyHeader>
                      <EmptyMedia className="text-sm" variant="icon"><Store /></EmptyMedia>
                      <EmptyTitle className="text-sm">No data yet</EmptyTitle>
                      <EmptyDescription className="text-sm">Complete some designs to see top categories.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>}
                {data.topStores.map((s, i) => {
                  const maxCount = data.topStores[0]?.count ?? 0;
                  const pct = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
                  const rankStyle =
                    i === 0 ? "text-yellow-500 bg-yellow-500/10" :
                      i === 1 ? "text-slate-400 bg-slate-400/10" :
                        i === 2 ? "text-amber-600 bg-amber-600/10" :
                          "text-muted-foreground bg-muted";
                  return (
                    <div key={s.id} className="flex flex-col gap-1.5 rounded-lg border p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${rankStyle}`}>
                            {i + 1}
                          </span>
                          <span className="text-sm truncate">{s.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{s.count}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted">
                        <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">Top Owner</CardTitle>
                <CardDescription>Most popular owners based on completed designs.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.topOwners.length === 0 &&
                  <Empty className="py-6 border border-dashed">
                    <EmptyHeader>
                      <EmptyMedia className="text-sm" variant="icon"><UserStar /></EmptyMedia>
                      <EmptyTitle className="text-sm">No data yet</EmptyTitle>
                      <EmptyDescription className="text-sm">Complete some designs to see top owners.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                }
                {data.topOwners.map((o, i) => {
                  const maxCount = data.topOwners[0]?.count ?? 0;
                  const pct = maxCount > 0 ? (o.count / maxCount) * 100 : 0;
                  const rankStyle =
                    i === 0 ? "text-yellow-500 bg-yellow-500/10" :
                      i === 1 ? "text-slate-400 bg-slate-400/10" :
                        i === 2 ? "text-amber-600 bg-amber-600/10" :
                          "text-muted-foreground bg-muted";
                  return (
                    <div key={o.id} className="flex flex-col gap-1.5 rounded-lg border p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${rankStyle}`}>
                            {i + 1}
                          </span>
                          <span className="text-sm truncate">{o.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{o.count}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted">
                        <div className="h-1 rounded-full bg-chart-2" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div >
  );
}