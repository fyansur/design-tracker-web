import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { CircleCheck, Trash2, Globe, Store, User, Clock } from "lucide-react";
import type { DailyGoalStat } from "@/types";
import { DailyGoalRow } from "./daily-goals-row";
import { DailyGoalCard } from "./daily-goals-card";

export function DailyGoalsList({
    dailyGoalStats,
    onUpdateTarget,
    onDelete,
    compact = false,
}: {
    dailyGoalStats: DailyGoalStat[];
    onUpdateTarget: (dailyGoalId: number, value: number) => void;
    onDelete: (dailyGoalId: number) => void;
    compact?: boolean;
}) {
    const [targetDrafts, setTargetDrafts] = useState<Record<number, string>>({});

    function handleBlur(dailyGoalId: number, currentTarget: number | null) {
        const draft = targetDrafts[dailyGoalId];
        const value = Number(draft);
        if (!draft || !value || value === currentTarget) return;
        onUpdateTarget(dailyGoalId, value);

    }

    if (dailyGoalStats.length === 0) {
        return (
            <Empty className="py-6">
                <EmptyHeader>
                    <EmptyMedia variant="icon"><Clock /></EmptyMedia>
                    <EmptyTitle className="text-sm">Belum ada daily goal</EmptyTitle>
                </EmptyHeader>
            </Empty>
        );
    }

    if (compact) {
        return (
            <div className="flex flex-col bg-card p-3 rounded-xl">
                {dailyGoalStats.map((s) => (
                    <DailyGoalRow key={s.dailyGoalId} stat={s} onUpdateTarget={onUpdateTarget} onDelete={onDelete} />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-card p-6 rounded-xl gap-4">
            {dailyGoalStats.map((s) => (
                <DailyGoalCard key={s.dailyGoalId} stat={s} onUpdateTarget={onUpdateTarget} onDelete={onDelete} />
            ))}
        </div>
    );
}