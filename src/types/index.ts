export interface Owner {
  id: number;
  name: string;
}

export interface Store {
  id: number;
  name: string;
  url: string;
  color: string;
  ownerId: number;
  owner?: Owner;
}

export interface Category {
  id: number;
  name: string;
}

export interface Goal {
  id: number;
  name: string;
  scope: "GLOBAL" | "STORE" | "OWNER";
  storeId: number | null;
  ownerId: number | null;
  targetCount: number;
  isPinned: boolean;
  completedCount: number;
  deadline: string | null;
  store?: { name: string; color: string } | null;
  createdAt: string; // <-- tambahin
}

export interface Design {
  id: number;
  name: string;
  ownerId: number | null;
  storeId: number | null;
  categoryId: number | null;
  referenceUrl: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  pinnedAt: string | null;
  owner?: Owner | null;
  store?: Store | null;
  category?: Category | null;
  goals?: { goal: Goal }[];
}

// Bentuk LENGKAP dari GET /api/daily-goals (ada histori target)
export interface DailyGoal {
  id: number;
  scope: "GLOBAL" | "STORE" | "OWNER";
  storeId: number | null;
  ownerId: number | null;
  store?: Store | null;
  owner?: Owner | null;
  targets: { targetCount: number; effectiveFrom: string }[];
}

// Bentuk RINGKAS dari GET /api/dashboard (flat, tanpa histori)
export interface DailyGoalSummary {
  id: number;
  scope: string;
  displayName: string;
  targetCount: number | null;
}

export interface Activity {
  id: number;
  description: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  isOnline?: boolean;
  monitorToken?: string;
}

export interface DailyGoalStatus {
  dailyGoalId: number;
  scope: string;
  displayName: string;
  status: "achieved" | "missed" | "no-target";
}

export interface ActivityBlock {
  date: string;
  count: number;
  isToday: boolean;
  dailyGoalStatuses: DailyGoalStatus[];
}

export interface DailyGoalStat {
  dailyGoalId: number;
  scope: string;
  displayName: string;
  targetCount: number | null;
  achievedToday: number;
  achievedDays: number;
  totalDays: number;
  store?: Store | null;
  owner?: Owner | null;
}

export interface Activity {
  id: number;
  description: string;
  event: string;
  subjectType: string;
  properties: { itemName?: string } | null;
  createdAt: string;
}

export interface AnalyticsData {
  period: "week" | "month" | "year";
  totalIdeas: number;
  totalIdeasChangePct: number | null;
  completedCount: number;
  completedCountChangePct: number | null;
  chartData: { label: string; completed: number }[];
  topStores: { id: number; name: string; color: string; count: number }[];
  topCategories: { id: number; name: string; count: number }[];
  topOwners: { id: number; name: string; count: number }[];
}


export interface DashboardData {
  today: {
    designs: number;
    completedDesigns: number;
    designsChangePct: number | null;
    completedChangePct: number | null;
  };
  totalIdeas: number;
  totalIdeasChangePct: number | null;
  completedCount: number;
  completedCountChangePct: number | null;
  totals: { stores: number; owners: number };
  period: "week" | "month" | "year";
  chartData: { label: string; completed: number }[];
  ranking: { storeId: number; name: string; color: string; completedCount: number }[];
  activityData: { date: string; count: number }[];
  goals: Goal[];
  dailyGoals: DailyGoalSummary[];
  recentActivities: Activity[];
  activityBlocks: ActivityBlock[];
  dailyGoalStats: DailyGoalStat[];
}