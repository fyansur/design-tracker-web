import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/lib/api";
import type { Store, Design } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface StoreDetailData {
    store: Store;
    period: string;
    chartData: { label: string; completed: number }[];
    dailyGoals: { id: number; scope: string; targetCount: number | null }[];
    designs: Design[];
}

export default function StoreDetail() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<StoreDetailData | null>(null);
    const [period, setPeriod] = useState<"week" | "month" | "year">("week");
    const navigate = useNavigate();
    useEffect(() => {
        api.get<StoreDetailData>(`/stores/${id}?period=${period}`).then((res) => setData(res.data));
    }, [id, period]);

    if (!data) return <p>Loading...</p>;

    return (
        <div className="flex flex-col gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>

            <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: data.store.color }} />
                <h1 className="text-xl font-semibold">{data.store.name}</h1>
                <span className="text-sm text-muted-foreground">— {data.store.owner?.name}</span>
            </div>

            <div className="flex gap-2">
                {(["week", "month", "year"] as const).map((p) => (
                    <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)}>
                        {p}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader><CardTitle className="text-sm">Completed Designs</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" fontSize={12} />
                            <YAxis allowDecimals={false} fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="completed" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-sm">Daily Goals Relevan</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {data.dailyGoals.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada.</p>}
                    {data.dailyGoals.map((dg) => (
                        <div key={dg.id} className="flex justify-between text-sm">
                            <span>{dg.scope}</span>
                            <Badge variant="secondary">target: {dg.targetCount ?? "-"}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-sm">Designs di Store Ini</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {data.designs.map((d) => (
                        <div key={d.id} className="flex items-center justify-between text-sm border-b pb-1 last:border-0">
                            <span>{d.name}</span>
                            {d.isCompleted && <Badge>✓ Completed</Badge>}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}