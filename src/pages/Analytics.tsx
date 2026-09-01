import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { AnalyticsData } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Palette, CircleCheck, Tag, User } from "lucide-react";

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

  if (!data) return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-foreground">Analytics</span>
        <Tabs value={period} onValueChange={(v) => v && setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="week">7d</TabsTrigger>
            <TabsTrigger value="month">30d</TabsTrigger>
            <TabsTrigger value="year">1y</TabsTrigger>
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

      <Card className="h-fit px-6 pt-10 pb-9">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="text-lg font-semibold text-foreground">Top Category</span>
          <div className="flex flex-col gap-2">
            {data.topCategories.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
            {data.topCategories.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{c.name}</span>
                </div>
                <span className="font-medium">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-lg font-semibold text-foreground">Top Store</span>
          <div className="flex flex-col gap-2">
            {data.topStores.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
            {data.topStores.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="truncate">{s.name}</span>
                </div>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-lg font-semibold text-foreground">Top Owner</span>
          <div className="flex flex-col gap-2">
            {data.topOwners.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
            {data.topOwners.map((o, i) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{o.name}</span>
                </div>
                <span className="font-medium">{o.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}