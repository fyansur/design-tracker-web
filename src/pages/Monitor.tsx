import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Palette, CircleCheck, ChevronLeft, ChevronRight, Store as StoreIcon } from "lucide-react";

const API_BASE = "http://localhost:4000/api";

interface MonitorData {
  monitoredUser: { name: string; isActive: boolean };
  designsToday: number;
  designsLast30Days: number;
  calendarData: { date: string; count: number; level: number; stores: { store_name: string; color: string; count: number }[] }[];
  recentCompletedDesigns: { id: number; name: string; store_name: string; owner_id: number | null; owner_name: string; completed_at: string }[];
  owners: { id: number; name: string }[];
  currentOwnerId: string;
}

const LEVEL_COLOR = ["bg-muted", "bg-chart-2/25", "bg-chart-2/50", "bg-chart-2/75", "bg-chart-2"];

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function Monitor() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<MonitorData | null>(null);
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Pakai axios langsung (BUKAN instance `api` kita) — endpoint ini public,
    // gak butuh withCredentials/cookies sama sekali.
    axios.get<MonitorData>(`${API_BASE}/monitor/${token}`, {
      params: { owner_id: ownerFilter, page },
    }).then((res) => setData(res.data));
  }, [token, ownerFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [ownerFilter]);

  if (!data) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  const weeks: (typeof data.calendarData)[] = [];
  for (let i = 0; i < data.calendarData.length; i += 7) {
    weeks.push(data.calendarData.slice(i, i + 7));
  }

  return (
    <div className="min-h-svh bg-background p-4 md:p-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">{data.monitoredUser.name}</span>
            <Badge variant={data.monitoredUser.isActive ? "default" : "secondary"} className="gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${data.monitoredUser.isActive ? "bg-green-400" : "bg-muted-foreground"}`} />
              {data.monitoredUser.isActive ? "Online" : "Offline"}
            </Badge>
          </div>
          <Select value={ownerFilter} onValueChange={(v) => v && setOwnerFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Owners">
                {ownerFilter === "all" ? "All Owners" : data.owners.find((o) => String(o.id) === ownerFilter)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {data.owners.map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm">Completed Today</span>
                  <span className="text-2xl font-bold">{data.designsToday}</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                  <CircleCheck className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm">Last 30 Days</span>
                  <span className="text-2xl font-bold">{data.designsLast30Days}</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                  <Palette className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Activity (Last Year)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.count} completed`}
                      className={`h-3 w-3 rounded-sm ${LEVEL_COLOR[day.level]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Recently Completed</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.recentCompletedDesigns.length === 0 && (
              <Empty className="py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><Palette /></EmptyMedia>
                  <EmptyTitle className="text-sm">No completed designs yet</EmptyTitle>
                  <EmptyDescription>Completed designs will show up here.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            {data.recentCompletedDesigns.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <StoreIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{d.name}</span>
                    <span className="text-xs text-muted-foreground">{d.store_name} ({d.owner_name})</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(d.completed_at)}</span>
              </div>
            ))}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{page}</span>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                disabled={data.recentCompletedDesigns.length < 10}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}