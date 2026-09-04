import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/lib/api";
import type { Store, Design, Goal, DailyGoalStat, Category, Owner } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Globe, Store as StoreIcon, User, Pin, Calendar, Trash2 } from "lucide-react";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { ExternalLink, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { EditDesignDialog } from "@/components/edit-design-dialog";
import { CreateDailyGoalDialog } from "@/components/create-daily-goal-dialog";
import { CreateGoalDialog } from "@/components/create-goal-dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
    DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Search, PackageOpen, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DailyGoalsList } from "@/components/daily-goals-list";
import { CampaignsList } from "@/components/campaigns-list";
import { DesignListSection } from "@/components/design-list-section";
import { LoadingScreen } from "@/components/loading-screen";

interface StoreDetailData {
    store: Store;
    period: string;
    chartData: { label: string; completed: number }[];
    dailyGoalStats: DailyGoalStat[];
    goals: Goal[];
    designs: Design[];
}

export default function StoreDetail() {
    const [stores, setStores] = useState<Store[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [sortBy, setSortBy] = useState<"date" | "name" | "category">("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [statusTab, setStatusTab] = useState<"pending" | "completed">("pending");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<StoreDetailData | null>(null);
    const [period, setPeriod] = useState<"week" | "month" | "year">("week");
    const [searchQuery, setSearchQuery] = useState("");
    const { setBreadcrumb } = useBreadcrumb();
    const navigate = useNavigate();

    async function fetchData() {
        const res = await api.get<StoreDetailData>(`/stores/${id}?period=${period}`);
        setData(res.data);
    }

    async function handleToggleComplete(design: Design) {
        try {
            await api.put(`/designs/${design.id}`, { isCompleted: !design.isCompleted });
            fetchData();
        } catch {
            alert("Failed to update status — make sure this design has an owner (via the store).");
        }
    }

    async function handleTogglePinDesign(designId: number) {
        await api.put(`/designs/${designId}/pin`);
        fetchData();
    }
    function formatDateTime(dateStr: string) {
        return new Date(dateStr).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit", hour12: true,
        });
    }

    useEffect(() => {
        api.get<Category[]>("/categories").then((res) => setCategories(res.data));
        api.get<Store[]>("/stores").then((res) => setStores(res.data));
        api.get<Owner[]>("/owners").then((res) => setOwners(res.data));
    }, []);

    useEffect(() => {
        fetchData();
    }, [id, period]);

    useEffect(() => {
        setPage(1);
    }, [statusTab, searchQuery, selectedCategoryIds, sortBy, sortDir]);

    useEffect(() => {
        if (data) {
            setBreadcrumb([
                { label: "Stores", href: "/stores" },
                { label: data.store.name },
            ]);
        }
        return () => setBreadcrumb(null);
    }, [data]);

    async function handleUpdateDailyGoalTarget(dailyGoalId: number, value: number) {
        await api.put(`/daily-goals/${dailyGoalId}/target`, { targetCount: value });
        fetchData();
    }
    async function handleTogglePinGoal(goalId: number) {
        await api.put(`/goals/${goalId}/pin`);
        fetchData();
    }
    async function handleDeleteDailyGoal(dailyGoalId: number) {
        await api.delete(`/daily-goals/${dailyGoalId}`);
        fetchData();
    }

    async function handleDeleteGoal(goalId: number) {
        await api.delete(`/goals/${goalId}`);
        fetchData();
    }

    async function handleDeleteDesign(designId: number) {
        await api.delete(`/designs/${designId}`);
        fetchData();
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

    if (!data) return <LoadingScreen />;

    function toggleCategoryFilter(categoryId: number) {
        setSelectedCategoryIds((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
        );
    }

    const filteredDesigns = data.designs
        .filter((d) => (statusTab === "completed" ? d.isCompleted : !d.isCompleted))
        .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter((d) => selectedCategoryIds.length === 0 || (d.categoryId && selectedCategoryIds.includes(d.categoryId)))
        .sort((a, b) => {
            if (statusTab === "pending") {
                if (a.isPinned && b.isPinned) {
                    // dua-duanya pinned: yang paling BARU di-pin, di atas
                    return new Date(b.pinnedAt!).getTime() - new Date(a.pinnedAt!).getTime();
                }
                const pinDiff = Number(b.isPinned) - Number(a.isPinned);
                if (pinDiff !== 0) return pinDiff;
            }
            let compare = 0;
            if (sortBy === "date") compare = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            else if (sortBy === "name") compare = a.name.localeCompare(b.name);
            else compare = (a.category?.name ?? "").localeCompare(b.category?.name ?? "");
            return sortDir === "asc" ? compare : -compare;
        });
    const storeCategories = Array.from(
        new Map(
            data.designs.filter((d) => d.category).map((d) => [d.category!.id, d.category!])
        ).values()
    );
    const totalPages = Math.max(1, Math.ceil(filteredDesigns.length / PAGE_SIZE));
    const pagedDesigns = filteredDesigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-col gap-6 p-4 space-y-2 md:p-8 overflow-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-chart-2">
                {/* Back button inline dengan nama toko */}
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: data.store.color }} />
                        <span className="text-lg font-semibold text-foreground">{data.store.name}</span>
                        <span className="text-sm text-muted-foreground">— {data.store.owner?.name}</span>
                    </div>
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />Back
                    </Button>
                </div>

                {/* Chart */}
                <div className="flex flex-row items-center justify-between gap-2">
                    <span className="text-lg font-semibold text-foreground">Performance</span>
                    <Tabs value={period} onValueChange={(v) => v && setPeriod(v as typeof period)}>
                        <TabsList className="w-100">
                            <TabsTrigger className="w-1/3" value="week">7d</TabsTrigger>
                            <TabsTrigger className="w-1/3" value="month">30d</TabsTrigger>
                            <TabsTrigger className="w-1/3" value="year">1y</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <Card className="flex min-h-fit">
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={data.chartData}>
                                <defs>
                                    <linearGradient id="fillStoreCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={1} />
                                        <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="label" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} fontSize={12} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="completed" stroke="var(--chart-2)" strokeWidth={2} fill="url(#fillStoreCompleted)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Separator />
                {/* Daily Goals + Goals, UI SAMA PERSIS kayak Dashboard */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-foreground">Daily Goals</span>
                            <CreateDailyGoalDialog stores={[]} owners={[]} lockedStoreId={data.store.id} onCreated={fetchData} />
                        </div>
                        <DailyGoalsList
                            dailyGoalStats={data.dailyGoalStats}
                            onUpdateTarget={handleUpdateDailyGoalTarget}
                            onDelete={handleDeleteDailyGoal}
                            compact
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-foreground">Campaigns</span>
                            <CreateGoalDialog stores={[]} owners={[]} lockedStoreId={data.store.id} onCreated={fetchData} />
                        </div>
                        <CampaignsList
                            goals={data.goals}
                            onTogglePin={handleTogglePinGoal}
                            onDelete={handleDeleteGoal}
                            compact
                        />
                    </div>
                </div>

                <Separator />
                {/* Designs — Table + search, buat scale ke ratusan item */}
                <div className="flex flex-col bg-card p-6 rounded-xl">
                    {/* Row 1: Title + Tabs, sejajar */}
                    <DesignListSection
                        title={`Designs in ${data.store.name}`}
                        designs={data.designs}
                        categories={categories}
                        stores={stores}
                        owners={owners}
                        sortOptions={["date", "name", "category"]}
                        onToggleComplete={handleToggleComplete}
                        onTogglePin={handleTogglePinDesign}
                        onDelete={handleDeleteDesign}
                        onUpdated={fetchData}
                    />
                </div>
            </div >
        </div>
    );
}