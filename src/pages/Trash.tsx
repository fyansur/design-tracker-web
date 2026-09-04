import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { PermanentDeleteButton } from "@/components/permanent-delete-button";
import {
  Search, RotateCcw, ChevronLeft, ChevronRight, Trash2,
  User, Store as StoreIcon, Tag, Palette, Target, Clock,
} from "lucide-react";
import { LoadingScreen } from "@/components/loading-screen";

type TrashType = "owner" | "store" | "category" | "design" | "goal" | "daily-goal";

const TYPE_CONFIG: Record<TrashType, { label: string; icon: any }> = {
  owner: { label: "Owners", icon: User },
  store: { label: "Stores", icon: StoreIcon },
  category: { label: "Categories", icon: Tag },
  design: { label: "Designs", icon: Palette },
  goal: { label: "Campaigns", icon: Target },
  "daily-goal": { label: "Daily Goals", icon: Clock },
};

const TYPES: TrashType[] = ["design", "store", "owner", "category", "goal", "daily-goal"];
const PAGE_SIZE = 10;

interface TrashItem {
  id: number;
  name?: string;
  color?: string;
  scope?: string;
  deletedAt: string;
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function getDisplayName(item: TrashItem, type: TrashType) {
  if (item.name) return item.name;
  if (type === "daily-goal" && item.scope) return `${item.scope} Daily Goal`;
  return `#${item.id}`;
}

export default function Trash() {
  const [type, setType] = useState<TrashType>("design");
  const [items, setItems] = useState<TrashItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    const res = await api.get<TrashItem[]>(`/trash?type=${type}`);
    setItems(res.data);
  }

  useEffect(() => {
    load();
  }, [type]);

  useEffect(() => {
    setPage(1);
  }, [type, searchQuery]);

  async function handleRestore(id: number) {
    await api.post(`/trash/${type}/${id}/restore`);
    load();
  }

  async function handleHardDelete(id: number) {
    await api.delete(`/trash/${type}/${id}`);
    load();
  }

  const filteredItems = items.filter((item) =>
    getDisplayName(item, type).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const Icon = TYPE_CONFIG[type].icon;

  if (!items) return <LoadingScreen />;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <span className="text-lg font-semibold text-foreground">Trash</span>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {TYPES.map((t) => {
          const TypeIcon = TYPE_CONFIG[t].icon;
          const isActive = type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-colors ${isActive ? "border-primary bg-primary/10" : "hover:bg-muted"
                }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-chart-2/10 text-chart-2"
                }`}>
                <TypeIcon className="h-5 w-5" />
              </div>
              <span className={`text-sm font-medium text-center ${isActive ? "text-primary" : ""}`}>
                {TYPE_CONFIG[t].label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col bg-card p-6 rounded-xl gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${TYPE_CONFIG[type].label.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-3">
          {pagedItems.length === 0 && (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon"><Trash2 /></EmptyMedia>
                <EmptyTitle>{searchQuery ? "No results found" : `No deleted ${TYPE_CONFIG[type].label.toLowerCase()}`}</EmptyTitle>
                <EmptyDescription>
                  {searchQuery
                    ? "Try a different search keyword."
                    : `Items you delete from ${TYPE_CONFIG[type].label.toLowerCase()} will show up here.`}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {pagedItems.map((item) => {
            const displayName = getDisplayName(item, type);
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {item.color ? (
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  ) : (
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{displayName}</span>
                    <span className="text-xs text-muted-foreground">Deleted {formatDateTime(item.deletedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => handleRestore(item.id)}>
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </Button>
                  <PermanentDeleteButton itemName={displayName} onConfirm={() => handleHardDelete(item.id)} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          <span>
            Showing {filteredItems.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>{page} / {totalPages}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}