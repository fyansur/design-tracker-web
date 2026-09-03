import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OWNER_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

interface RankingItem { storeId: number; name: string; completedCount: number; color: string }
interface RankingByOwnerItem { ownerId: number; name: string; completedCount: number }

export function DesignsDistributionCard({
    ranking, rankingByOwner, completedCount,
}: { ranking: RankingItem[]; rankingByOwner: RankingByOwnerItem[]; completedCount: number }) {
    const [distributionTab, setDistributionTab] = useState<"store" | "owner">("store");

    const items =
        distributionTab === "store"
            ? ranking.map((r) => ({ key: r.storeId, name: r.name, count: r.completedCount, color: r.color }))
            : rankingByOwner.map((o, i) => ({ key: o.ownerId, name: o.name, count: o.completedCount, color: OWNER_COLORS[i % OWNER_COLORS.length] }));

    return (
        <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Distribution</CardTitle>
                <Tabs value={distributionTab} onValueChange={(v) => v && setDistributionTab(v as typeof distributionTab)}>
                    <TabsList>
                        <TabsTrigger value="store">Store</TabsTrigger>
                        <TabsTrigger value="owner">Owner</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                {items.length === 0 || completedCount === 0 ? (
                    <p className="text-sm text-muted-foreground">No data available.</p>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative h-40 w-40 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={items}
                                        dataKey="count"
                                        nameKey="name"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={2}
                                        stroke="none"
                                    >
                                        {items.map((item) => <Cell key={item.key} fill={item.color} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--popover)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-foreground">{completedCount}</span>
                                <span className="text-xs text-muted-foreground">Designs</span>
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-2 min-w-0">
                            {items.map((item) => {
                                const pct = Math.round((item.count / completedCount) * 100);
                                return (
                                    <div key={item.key} className="flex items-center justify-between gap-2 text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="truncate">{item.name}</span>
                                        </div>
                                        <span className="font-medium">
                                            {item.count} <span className="text-muted-foreground font-normal">({pct}%)</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}