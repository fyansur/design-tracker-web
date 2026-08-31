import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CreateGoalDialog } from "./create-goal-dialog";

interface Goal {
    id: number;
    name: string;
    targetCount: number;
    completedCount: number;
}

interface DailyGoal {
    id: number;
    scope: string;
    displayName?: string;
    achievedToday: number;
    targets: { targetCount: number; effectiveFrom: string }[];
}

interface Activity {
    id: number;
    description: string;
    createdAt: string;
}

interface DashboardStats {
    totalIdeas: number;
    completedCount: number;
    goals: Goal[];
    dailyGoals: DailyGoal[];
    recentActivities: Activity[];
}

export function ProgressAside() {
    const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
    const [owners, setOwners] = useState<{ id: number; name: string }[]>([]);
    const [data, setData] = useState<DashboardStats | null>(null);


    

    useEffect(() => {
        api.get<DashboardStats>("/dashboard?period=week").then((res) => {
            setData(res.data);
        }).catch((err) => {
        });
    }, []);

    if (!data) return null;
    async function load() {
        const res = await api.get<DashboardStats>("/dashboard?period=week");
        setData(res.data);
    }
    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <p>Total ide (minggu ini): {data.totalIdeas}</p>
                    <p>Completed: {data.completedCount}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2 flex-row items-center justify-between">
                    <CardTitle className="text-sm">Goals</CardTitle>
                    <CreateGoalDialog stores={stores} owners={owners} onCreated={load} />
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {data.goals.length === 0 && <p className="text-sm text-muted-foreground">Belum ada goal aktif.</p>}
                    {data.goals.map((g) => (
                        <div key={g.id} className="flex items-center justify-between text-sm">
                            <span className="truncate">{g.name}</span>
                            <Badge variant="secondary">{g.completedCount}/{g.targetCount}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Daily Goals</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {data.dailyGoals.length === 0 && <p className="text-sm text-muted-foreground">Belum ada daily goal.</p>}
                    {data.dailyGoals.map((dg) => (
                        <div key={dg.id} className="flex items-center justify-between text-sm">
                            <span className="truncate">{dg.displayName ?? dg.scope}</span>
                            <Badge variant={dg.achievedToday >= (dg.targets[0]?.targetCount ?? 0) ? "default" : "secondary"}>
                                {dg.achievedToday}/{dg.targets[0]?.targetCount ?? "-"}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="flex-1 min-h-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-64">
                        <div className="flex flex-col gap-2">
                            {data.recentActivities.map((a, i) => (
                                <div key={a.id}>
                                    <p className="text-sm">{a.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(a.createdAt).toLocaleString()}
                                    </p>
                                    {i < data.recentActivities.length - 1 && <Separator className="mt-2" />}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}