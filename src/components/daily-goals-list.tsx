import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Clock } from "lucide-react";
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

    if (dailyGoalStats.length === 0) {
        return (
            <div className="flex flex-col bg-card p-6 px-6 rounded-xl h-50">
                <Empty className="py-6 border border-dashed">
                    <EmptyHeader>
                        <EmptyMedia className="text-sm" variant="icon"><Clock /></EmptyMedia>
                        <EmptyTitle className="text-sm">No daily goals yet</EmptyTitle>
                        <EmptyDescription className="text-sm">Create a daily goal to get started.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex flex-col dark:bg-card bg-background ring-1 ring-foreground/10 p-3 px-6 rounded-xl">
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