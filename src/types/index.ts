export interface User {
  id: number;
  name: string;
  email: string;
  isOnline?: boolean;
  monitorToken?: string;
}

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

export interface Design {
  id: number;
  name: string;
  ownerId: number | null;
  storeId: number | null;
  categoryId: number | null;
  referenceUrl: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  owner?: Owner | null;
  store?: Store | null;
  category?: Category | null;
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
}