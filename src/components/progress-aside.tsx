import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CreateGoalDialog } from "./create-goal-dialog";
import { CreateDailyGoalDialog } from "./create-daily-goal-dialog";
import { TodayStatsCards } from "./today-stats-cards";
import { DailyGoalsList } from "./daily-goals-list";
import { CampaignsList } from "./campaigns-list";
import { RecentActivityFeed } from "./recent-activity-feed";
import type { Store, Owner, DashboardData } from "@/types";

export function ProgressAside() {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [data, setData] = useState<DashboardData | null>(null);

  async function load() {
    const res = await api.get<DashboardData>("/dashboard?period=week");
    setData(res.data);
  }

  useEffect(() => {
    load();
    api.get<Store[]>("/stores").then((res) => setStores(res.data));
    api.get<Owner[]>("/owners").then((res) => setOwners(res.data));
  }, []);

  async function handleUpdateDailyGoalTarget(dailyGoalId: number, value: number) {
    await api.put(`/daily-goals/${dailyGoalId}/target`, { targetCount: value });
    load();
  }
  async function handleDeleteDailyGoal(dailyGoalId: number) {
    await api.delete(`/daily-goals/${dailyGoalId}`);
    load();
  }
  async function handleTogglePinGoal(goalId: number) {
    await api.put(`/goals/${goalId}/pin`);
    load();
  }
  async function handleDeleteGoal(goalId: number) {
    await api.delete(`/goals/${goalId}`);
    load();
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Today</span>
        <TodayStatsCards data={data} showTotals={false} showIcon={false} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Daily Goals</span>
          <CreateDailyGoalDialog stores={stores} owners={owners} existingDailyGoals={data.dailyGoalStats} onCreated={load} />
        </div>
        <DailyGoalsList
          dailyGoalStats={data.dailyGoalStats}
          onUpdateTarget={handleUpdateDailyGoalTarget}
          onDelete={handleDeleteDailyGoal}
          compact
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Campaigns</span>
          <CreateGoalDialog stores={stores} owners={owners} onCreated={load} />
        </div>
        <CampaignsList
          goals={data.goals}
          onTogglePin={handleTogglePinGoal}
          onDelete={handleDeleteGoal}
          compact
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Recent Activity</span>
        <RecentActivityFeed activities={data.recentActivities} compact height="h-100" />
      </div>
    </div>
  );
} 