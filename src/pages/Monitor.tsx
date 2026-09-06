import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  Palette, CircleCheck, ChevronLeft, ChevronRight, Monitor as MonitorIcon,
  Flame, Clock, TrendingUp, ExternalLink, Store, Send
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PulsatingButton } from "@/components/ui/pulsating-button";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ACCENT = "#399266";

interface MonitorData {
  monitoredUser: { name: string; isActive: boolean };
  designsToday: number;
  designsLast30Days: number;
  totalAllTime: number;
  pendingCount: number;
  averagePerDay: number;
  streak: number;
  calendarData: { date: string; count: number; level: number; stores: { store_name: string; color: string; count: number }[] }[];
  storeBreakdown: { store_name: string; color: string; count: number }[];
  recentCompletedDesigns: { id: number; name: string; store_name: string; owner_id: number | null; owner_name: string; completed_at: string; reference_url: string | null }[];
  owners: { id: number; name: string }[];
  currentOwnerId: string;
  perPage: number;
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// Angka naik dari 0 ke target pas mount
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatCard({
  label, target, suffix, icon: Icon, iconClass, iconAnimated,
}: { label: string; target: number; suffix?: string; icon: any; iconClass: string; iconAnimated?: boolean }) {
  const value = useCountUp(target);
  return (
    <div
      className="flex items-center justify-between rounded-2xl border p-4.5 transition-all hover:shadow-[0_0_20px_rgba(57,146,102,0.25)] bg-card"
      style={{ borderColor: "var(--border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = ACCENT)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      <div>
        <div className="mb-1.5 text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}{suffix}</div>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${iconClass} ${iconAnimated ? "animate-[flicker_1.5s_ease-in-out_infinite_alternate]" : ""}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
    </div>
  );
}
function StoreBar({ store, totalAllTime }: { store: { store_name: string; color: string; count: number }; totalAllTime: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  const pct = Math.round((store.count / totalAllTime) * 100) || 0;

  return (
    <div className="flex items-center justify-between border-b py-2.5 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2.5">
          <Store className="h-4 w-4" style={{ color: store.color }} />
          <span className="text-[13px]">{store.store_name}</span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-out"
            style={{ width: mounted ? `${pct}%` : "0%", backgroundColor: store.color }}
          />
        </div>
      </div>
      <div className="ml-4 whitespace-nowrap text-[13px] text-muted-foreground">{store.count} ({pct}%)</div>
    </div>
  );
}

function TaskItem({ d, index }: { d: MonitorData["recentCompletedDesigns"][number]; index: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600 + index * 100);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="mb-2.5 flex items-center justify-between rounded-[10px] border bg-muted/50 px-4 py-3.5 transition-all last:mb-0"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(10px)",
        transition: "all 0.4s ease",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}>
          <MonitorIcon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">{d.name}</div>
          <div className="text-xs text-muted-foreground">{d.store_name} ({d.owner_name})</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right text-xs text-muted-foreground">{formatDateTime(d.completed_at)}</div>
        <Button
          variant="outline"
          className="h-8"
          disabled={!d.reference_url}
          onClick={() => d.reference_url && window.open(d.reference_url, "_blank")}
        >
          <ExternalLink className="h-4 w-4" /> See on Etsy
        </Button>
      </div>
    </div>
  );
}

export default function Monitor() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<MonitorData | null>(null);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<number[]>([]);
  const initializedRef = useRef(false);
  const [page, setPage] = useState(1);

  function toggleOwner(ownerId: number) {
    setSelectedOwnerIds((prev) =>
      prev.includes(ownerId) ? prev.filter((id) => id !== ownerId) : [...prev, ownerId]
    );
  }
  useEffect(() => {
    axios.get<MonitorData>(`${API_BASE}/monitor/${token}`, {
      params: { owner_ids: selectedOwnerIds.join(","), page },
    }).then((res) => {
      setData(res.data);
      if (!initializedRef.current && res.data.owners.length > 0) {
        setSelectedOwnerIds(res.data.owners.map((o) => o.id));
        initializedRef.current = true;
      }
    });
  }, [token, selectedOwnerIds, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedOwnerIds]);

  if (!data) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  const pageSize = data.perPage;
  const weeks: (typeof data.calendarData)[] = [];
  for (let i = 0; i < data.calendarData.length; i += 7) {
    weeks.push(data.calendarData.slice(i, i + 7));
  }
  return (
    <div className="min-h-svh bg-background p-4 md:p-10 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-chart-2">

      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-semibold">{data.monitoredUser.name}</span>
            <div className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
              <span
                className={`absolute h-2 w-2 rounded-full ${data.monitoredUser.isActive ? "g" : ""}`}
                style={{
                  backgroundColor: data.monitoredUser.isActive ? "#4ade80" : "var(--muted-foreground)",
                  boxShadow: data.monitoredUser.isActive ? "0 0 6px #4ade80" : "none",
                }}
              />
              <span
                className={`h-2 w-2 rounded-full ${data.monitoredUser.isActive ? "animate-ping" : ""}`}
                style={{
                  backgroundColor: data.monitoredUser.isActive ? "#4ade80" : "var(--muted-foreground)",
                  boxShadow: data.monitoredUser.isActive ? "0 0 6px #4ade80" : "none",
                }}
              />
              <span>{data.monitoredUser.isActive ? "Online" : "Offline"}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filter by</span>
            {data.owners.map((o) => {
              const isActive = selectedOwnerIds.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggleOwner(o.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground hover:bg-muted"
                    }`}
                >
                  {o.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Today" target={data.designsToday} icon={CircleCheck} iconClass="text-[#399266]" />
          <StatCard label="Streak" target={data.streak} suffix="d" icon={Flame} iconClass="text-amber-500" iconAnimated />
          <StatCard label="Total All-Time" target={data.totalAllTime} icon={Palette} iconClass="text-[#399266]" />
          <StatCard label="Pending" target={data.pendingCount} icon={Clock} iconClass="text-amber-500" />
        </div>

        {/* Heatmap */}
        <Card className="bg-card">
          <CardHeader className="flex items-center justify-between"><CardTitle className="text-sm">Activity</CardTitle>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> {data.averagePerDay}/day avg (30d)
            </span>
          </CardHeader>
          <CardContent>
            <TooltipProvider delay={100}>
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
              >
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((day) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger
                          render={
                            <div
                              className={`aspect-square rounded-sm ${day.level > 0 ? "animate-[pulse-glow_2s_infinite]" : ""}`}
                              style={{
                                backgroundColor: day.level === 0 ? "var(--muted)" : ACCENT,
                                opacity: day.level === 0 ? 1 : [0.35, 0.55, 0.75, 1][day.level - 1],
                              }}
                            />
                          }
                        />
                        <TooltipContent className="flex flex-col gap-1.5 p-2 justify-start items-stretch">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-muted-foreground">
                              {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="font-semibold">{day.count} completed</span>
                          </div>
                          {day.stores.length > 0 && (
                            <div className="flex flex-col gap-1 border-t pt-1.5 justify-start">
                              {day.stores.map((s) => (
                                <div key={s.store_name} className="flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span>{s.store_name}</span>
                                  </div>
                                  <span className="text-muted-foreground">{s.count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Store Breakdown */}
        <div className="rounded-2xl border p-5 bg-card">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold">Store Breakdown</span>
          </div>
          {data.storeBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed designs yet.</p>
          ) : (
            data.storeBreakdown.map((s) => (
              <StoreBar key={s.store_name} store={s} totalAllTime={data.totalAllTime} />
            ))
          )}
        </div>

        {/* Recently Completed */}
        <div className="rounded-2xl border p-5 bg-card">
          <div className="mb-4 text-sm font-semibold">Recently Completed</div>
          {data.recentCompletedDesigns.length === 0 ? (
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon"><Palette /></EmptyMedia>
                <EmptyTitle className="text-sm">No completed designs yet</EmptyTitle>
                <EmptyDescription>Completed designs will show up here.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            data.recentCompletedDesigns.map((d, i) => <TaskItem key={d.id} d={d} index={i} />)
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{page}</span>
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              disabled={data.recentCompletedDesigns.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <PulsatingButton
        variant="ripple"
        pulseColor="#26A5E4"
        distance="10px"
        duration="1s"
        className="fixed bottom-6 right-6 z-50 gap-2 bg-[#26A5E4] text-white shadow-lg hover:bg-[#1e8fc9]"
        onClick={() => window.open("https://t.me/fyansur", "_blank")}
      >
        <div className="flex items-center gap-2">
        <Send className="h-4 w-4" />
        Chat via Telegram</div>
      </PulsatingButton>
    </div>
  );
}