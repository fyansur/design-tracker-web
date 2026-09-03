import { useEffect, useState } from "react";
import type { Design, Category, Owner, Store } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
    DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
    Search, ArrowUp, ArrowDown, ChevronDown, ChevronLeft, ChevronRight, RotateCcw,
    ExternalLink, Pin, Calendar, Clock, Trash2,
} from "lucide-react";
import { EditDesignDialog } from "@/components/edit-design-dialog";
import { AssignStoreDialog } from "@/components/assign-store-dialog";
const PAGE_SIZE = 5;
type SortKey = "date" | "name" | "category" | "store";

const SORT_LABEL: Record<SortKey, string> = { date: "Date", name: "Name", category: "Category", store: "Store" };

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
    });
}

export function DesignListSection({
    title,
    designs,
    categories,
    stores,
    owners,
    sortOptions = ["date", "name", "category", "store"],
    onToggleComplete,
    onTogglePin,
    onDelete,
    onUpdated,
}: {
    title: string;
    designs: Design[];
    categories: Category[];
    sortOptions?: SortKey[];
    stores: Store[];
    owners: Owner[];
    onToggleComplete: (design: Design) => void;
    onTogglePin: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdated: () => void;
}) {
    const [statusTab, setStatusTab] = useState<"pending" | "completed">("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [statusTab, searchQuery, selectedCategoryIds, sortBy, sortDir]);

    function toggleCategoryFilter(categoryId: number) {
        setSelectedCategoryIds((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
        );
    }

    const usedCategories = Array.from(
        new Map(designs.filter((d) => d.category).map((d) => [d.category!.id, d.category!])).values()
    );

    const filteredDesigns = designs
        .filter((d) => (statusTab === "completed" ? d.isCompleted : !d.isCompleted))
        .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter((d) => selectedCategoryIds.length === 0 || (d.categoryId && selectedCategoryIds.includes(d.categoryId)))
        .sort((a, b) => {
            if (statusTab === "pending") {
                if (a.isPinned && b.isPinned) return new Date(b.pinnedAt!).getTime() - new Date(a.pinnedAt!).getTime();
                const pinDiff = Number(b.isPinned) - Number(a.isPinned);
                if (pinDiff !== 0) return pinDiff;
            }
            if (!sortBy) return 0;
            let compare = 0;
            if (sortBy === "date") compare = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            else if (sortBy === "name") compare = a.name.localeCompare(b.name);
            else if (sortBy === "category") compare = (a.category?.name ?? "").localeCompare(b.category?.name ?? "");
            else compare = (a.store?.name ?? "").localeCompare(b.store?.name ?? "");
            return sortDir === "asc" ? compare : -compare;
        });

    const totalPages = Math.max(1, Math.ceil(filteredDesigns.length / PAGE_SIZE));
    const pagedDesigns = filteredDesigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row w-full items-center justify-between gap-2">
                <Tabs className="w-full" value={statusTab} onValueChange={(v) => v && setStatusTab(v as typeof statusTab)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger className="cursor-pointer" value="pending">Pending</TabsTrigger>
                        <TabsTrigger className="cursor-pointer" value="completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search designs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" className="w-28 justify-between" />}>
                        {sortBy === null ? "Sort by" : SORT_LABEL[sortBy]}
                        <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuRadioGroup value={sortBy ?? undefined} onValueChange={(v) => v && setSortBy(v as SortKey)}>
                            {sortOptions.map((opt) => (
                                <DropdownMenuRadioItem key={opt} value={opt}>{SORT_LABEL[opt]}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                {sortBy !== null && (
                    <>
                        <Button variant="outline" size="icon" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
                            {sortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => { setSortBy(null); setSortDir("desc"); }}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by</span>
                {usedCategories.length === 0 && <span className="text-sm text-muted-foreground">No categories available.</span>}
                {usedCategories.map((c) => {
                    const isActive = selectedCategoryIds.includes(c.id);
                    return (
                        <button
                            key={c.id} type="button" onClick={() => toggleCategoryFilter(c.id)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            {c.name}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3">
                {pagedDesigns.length === 0 && (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon"><Search /></EmptyMedia>
                            <EmptyTitle>{searchQuery || selectedCategoryIds.length > 0 ? "No results found" : `No designs ${statusTab} yet`}</EmptyTitle>
                            <EmptyDescription>
                                {searchQuery || selectedCategoryIds.length > 0
                                    ? "Try changing the search keywords or filtering by category."
                                    : statusTab === "pending"
                                        ? "New designs that haven't been completed will appear here."
                                        : "Designs that have been completed will appear here."}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
                {pagedDesigns.map((d) => {
                    const needsStoreAssignment = d.isCompleted && !d.storeId;
                    return (
                        <div key={d.id} className="flex flex-col gap-3 rounded-lg border p-6 bg-background">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col gap-2 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                    {needsStoreAssignment ? (
                                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                                            
                                        </span>
                                    ) : (
                                        <>
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.store?.color ?? "var(--muted-foreground)" }} /> 
                                        
                                        </>
                                    )}
                                        <span className="text-sm font-semibold truncate">{d.name}</span>
                                        </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-xs ${needsStoreAssignment ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                                            {d.store
                                                ? `${d.store.name} (${d.owner?.name ?? "Unknown"})`
                                                : d.owner
                                                    ? `Please assign a store (${d.owner.name})`
                                                    : "No store"}
                                            {d.category ? ` · ${d.category.name}` : ""}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 shrink-0">
                                    {needsStoreAssignment && (
                                        <AssignStoreDialog design={d} stores={stores} owners={owners} onAssigned={onUpdated} />
                                    )}
                                    <EditDesignDialog design={d} categories={categories} stores={stores} owners={owners} onUpdated={onUpdated} />
                                    {d.referenceUrl && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(d.referenceUrl!, "_blank")}>
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {statusTab === "pending" && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onTogglePin(d.id)}>
                                            <Pin className={`h-4 w-4 ${d.isPinned ? "fill-current text-chart-2" : ""}`} />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(d.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 border-t pt-3">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Created {formatDateTime(d.createdAt)}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Updated {formatDateTime(d.updatedAt)}</span>
                                </div>
                                {d.isCompleted ? (
                                    <Button size="sm" variant="secondary" onClick={() => onToggleComplete(d)}>Completed</Button>
                                ) : (
                                    <Button size="sm" onClick={() => onToggleComplete(d)}>Mark as Complete</Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm text-muted-foreground">
                <span>
                    {statusTab === "completed" ? "Completed" : "Pending"}: {filteredDesigns.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredDesigns.length)} of {filteredDesigns.length}
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
    );
}