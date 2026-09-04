import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Store, Owner } from "@/types";
import { CreateStoreDialog } from "@/components/create-store-dialog";
import { CreateOwnerDialog } from "@/components/create-owner-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { DeleteStoreButton } from "@/components/delete-store-button";
import { ExternalLink } from "lucide-react";
import { OwnerRow } from "@/components/owner-row";
import { EditStoreDialog } from "@/components/edit-store-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { DashboardData } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Store as StoreIcon, UserStar } from "lucide-react";
import { DesignsDistributionCard } from "@/components/designs-distribution-card";
import { LoadingScreen } from "@/components/loading-screen";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<"name" | "owner" | "designs" | null>(null);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedOwnerIds, sortBy, sortDir]);

  async function loadAll() {
    const [storesRes, ownersRes] = await Promise.all([
      api.get<Store[]>("/stores"),
      api.get<Owner[]>("/owners"),
    ]);
    setStores(storesRes.data);
    setOwners(ownersRes.data);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleDeleteStore(id: number) {
    await api.delete(`/stores/${id}`);
    loadAll();
  }

  function toggleOwnerFilter(ownerId: number) {
    setSelectedOwnerIds((prev) =>
      prev.includes(ownerId) ? prev.filter((id) => id !== ownerId) : [...prev, ownerId]
    );
  }

  function handleResetFilters() {
    setSearchQuery("");
    setSortBy(null);
    setSortDir("asc");
    setSelectedOwnerIds([]);
  }
  const filteredStores = stores
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((s) => selectedOwnerIds.length === 0 || selectedOwnerIds.includes(s.ownerId))
    .sort((a, b) => {
      if (!sortBy) return 0;
      let compare = 0;
      if (sortBy === "name") compare = a.name.localeCompare(b.name);
      else if (sortBy === "owner") compare = (a.owner?.name ?? "").localeCompare(b.owner?.name ?? "");
      else compare = (a.designCount ?? 0) - (b.designCount ?? 0);
      return sortDir === "asc" ? compare : -compare;
    });

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));
  const pagedStores = filteredStores.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function SortIcon({ column }: { column: "name" | "owner" | "designs" }) {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  }

  function toggleSort(column: "name" | "owner" | "designs") {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(column); setSortDir("asc"); }
  }
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/dashboard?period=week").then((res) => setDashboardData(res.data));
  }, []);
  if (!dashboardData) return <LoadingScreen />;
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-chart-2">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Stores: bagian utama */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Stores</span>
              <CreateStoreDialog stores={stores} owners={owners} onCreated={loadAll} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent>
                  <div className="grid grid-cols-12 justify-between">
                    <div className="col-span-10 flex flex-col justify-between gap-2">
                      <span className="text-muted-foreground text-base leading-none">Total Stores</span>
                      <span className="text-primary text-2xl font-bold leading-none">{stores.length}</span>
                    </div>
                    <div className="col-span-2 justify-self-end">
                      <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                        <StoreIcon />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="grid grid-cols-12 justify-between">
                    <div className="col-span-10 flex flex-col justify-between gap-2">
                      <span className="text-muted-foreground text-base leading-none">Total Owners</span>
                      <span className="text-primary text-2xl font-bold leading-none">{owners.length}</span>
                    </div>
                    <div className="col-span-2 justify-self-end">
                      <div className="w-16 h-16 items-center justify-center flex border-chart-2 bg-chart-2/10 text-chart-2 rounded-lg">
                        <UserStar />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Search + Sort */}
            <div className="flex flex-col gap-6 bg-card p-6 rounded-xl border">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" className="w-28 justify-between" />}>
                    {sortBy === null ? "Sort by" : sortBy === "name" ? "Store" : sortBy === "owner" ? "Owner" : "Designs"}
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={sortBy ?? undefined} onValueChange={(v) => v && setSortBy(v as typeof sortBy)}>
                      <DropdownMenuRadioItem value="name">Store</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="owner">Owner</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="designs">Designs</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                {sortBy !== null && (
                  <>
                    <Button variant="outline" size="icon" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
                      {sortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleResetFilters}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Filter by Owner */}
              {owners.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Filter by</span>
                  {owners.map((o) => {
                    const isActive = selectedOwnerIds.includes(o.id);
                    return (
                      <button
                        key={o.id} type="button" onClick={() => toggleOwnerFilter(o.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground hover:bg-muted"
                          }`}
                      >
                        {o.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {pagedStores.length === 0 ? (
                <Empty className="py-6 border border-dashed rounded-lg">
                  <EmptyHeader>
                    <EmptyMedia className="text-sm" variant="icon">{searchQuery || selectedOwnerIds.length > 0 ? <Search /> : <StoreIcon />}</EmptyMedia>
                    <EmptyTitle className="text-sm">{searchQuery || selectedOwnerIds.length > 0 ? "No results found" : "No stores yet"}</EmptyTitle>
                    <EmptyDescription className="text-sm">
                      {searchQuery || selectedOwnerIds.length > 0
                        ? "Try a different search keyword or filter."
                        : "Add your first store to get started."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-t">
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                        <span className="flex items-center gap-1">Store <SortIcon column="name" /></span>
                      </TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("owner")}>
                        <span className="flex items-center gap-1">Owner <SortIcon column="owner" /></span>
                      </TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("designs")}>
                        <span className="flex items-center gap-1">Designs <SortIcon column="designs" /></span>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedStores.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Link to={`/stores/${s.id}`} className="flex items-center gap-2 hover:underline font-medium">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{s.owner?.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{s.completedCount ?? 0}/{s.designCount ?? 0} designs</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="sm" className="h-7 gap-1" onClick={() => window.open(s.url, "_blank")}>
                              <ExternalLink className="h-3 w-3" /> Etsy
                            </Button>
                            <EditStoreDialog store={s} stores={stores} owners={owners} onUpdated={loadAll} />
                            <DeleteStoreButton storeName={s.name} onConfirm={() => handleDeleteStore(s.id)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <div className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm text-muted-foreground">
                <span>
                  Showing {filteredStores.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredStores.length)} of {filteredStores.length} stores
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span>{page}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Owners: panel manage di samping */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Owners</span>
              <CreateOwnerDialog owners={owners} onCreated={loadAll} />
            </div>
            <div className="flex flex-col gap-3">
              {owners.length === 0 && (
                <p className="text-sm text-muted-foreground">No owners yet.</p>
              )}
              {owners.map((o) => (
                <OwnerRow key={o.id} owner={o} owners={owners} onRenamed={loadAll} onDelete={loadAll} />
              ))}
            </div>
            {dashboardData && (
              <DesignsDistributionCard
                ranking={dashboardData.ranking}
                rankingByOwner={dashboardData.rankingByOwner}
                completedCount={dashboardData.completedCount}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}