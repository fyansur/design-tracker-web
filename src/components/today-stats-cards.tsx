import { Card, CardContent } from "@/components/ui/card";
import { Palette, CircleCheck, Store, UserStar } from "lucide-react";
import { ChangeBadge } from "@/lib/dashboard-shared";
import type { DashboardData } from "@/types";

export function TodayStatsCards({
  data,
  showTotals = true,
  showIcon = true,
}: {
  data: DashboardData;
  showTotals?: boolean;
  showIcon?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent>
          <div className="grid grid-cols-12 justify-between">
            <div className={showIcon ? "col-span-10 flex flex-col justify-between gap-2" : "col-span-12 flex flex-col justify-between gap-2"}>
              <span className="text-muted-foreground text-base leading-none">Ideas</span>
              <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                {data.today.designs}
                <ChangeBadge pct={data.today.designsChangePct} />
              </span>
            </div>
            {showIcon && (
              <div className="col-span-2 justify-self-end">
                <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                  <Palette />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="grid grid-cols-12 justify-between">
            <div className={showIcon ? "col-span-10 flex flex-col justify-between gap-2" : "col-span-12 flex flex-col justify-between gap-2"}>
              <span className="text-muted-foreground text-base leading-none">Designs</span>
              <span className="text-primary text-2xl font-bold flex items-end gap-2 leading-none">
                {data.today.completedDesigns}
                <ChangeBadge pct={data.today.completedChangePct} />
              </span>
            </div>
            {showIcon && (
              <div className="col-span-2 justify-self-end">
                <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                  <CircleCheck />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {showTotals && (
        <>
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
        </>
      )}
    </div>
  );
}