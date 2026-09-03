import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { CircleCheck, Trash2, Globe, Store, User } from "lucide-react";
import { dailyGoalTargetFormSchema, type DailyGoalTargetFormInput, type DailyGoalTargetForm } from "@/lib/validation";
import type { DailyGoalStat } from "@/types";

export function DailyGoalCard({
    stat,
    onUpdateTarget,
    onDelete,
}: {
    stat: DailyGoalStat;
    onUpdateTarget: (dailyGoalId: number, value: number) => void;
    onDelete: (dailyGoalId: number) => void;
}) {
    const form = useForm<DailyGoalTargetFormInput, unknown, DailyGoalTargetForm>({
        resolver: zodResolver(dailyGoalTargetFormSchema),
        defaultValues: { targetCount: stat.targetCount ?? 1 },
    });

    const scopeLabel = `${stat.scope} DAILY`;
    const ScopeIcon = stat.scope === "STORE" ? Store : stat.scope === "OWNER" ? User : Globe;
    const isAchievedToday = stat.targetCount !== null && stat.achievedToday >= stat.targetCount;

    function handleBlur() {
        form.handleSubmit((values) => {
            if (values.targetCount !== stat.targetCount) {
                onUpdateTarget(stat.dailyGoalId, values.targetCount);
            }
        })();
    }

    return (
        <div className={`relative flex flex-col gap-4 rounded-xl border ${isAchievedToday ? 'border-chart-2/50 opacity-50' : ''} p-6 bg-card`}>
            {isAchievedToday && (
                <div className="absolute -top-3 -right-3 items-center min-w-0 text-chart-2/50 bg-card rounded-lg text-xs">
                    <CircleCheck className="h-6 w-6" />
                </div>
            )}
            <div className="grid grid-cols-4 items-center justify-between gap-3">
                <div className="col-span-2 flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                        <ScopeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-semibold tracking-wide text-chart-2">{scopeLabel}</span>
                        {stat.scope !== "GLOBAL" && (
                            <span className="text-sm font-semibold truncate">{stat.displayName}</span>
                        )}
                    </div>
                </div>
                <div className="flex col-span-2 justify-end items-center gap-1 shrink-0">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <Controller
                            name="targetCount"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <>
                                    <div
                                        className={`flex items-center justify-center rounded-md ring ${fieldState.invalid ? "ring-2 ring-destructive" : "ring-foreground/10"
                                            }`}
                                    >
                                        <div className="h-8 w-10 text-sm flex items-center px-2 py-1 justify-center rounded-l-md">{stat.achievedToday}</div>
                                        <div className="h-8 w-6 text-sm flex items-center justify-center border-x">/</div>
                                        <InputGroup className="h-8 w-10 rounded-none! ring-0! outline-0! border-0! rounded-r-md! bg-background!">
                                            <InputGroupInput
                                                aria-invalid={fieldState.invalid}
                                                type="number"
                                                min={1}
                                                value={field.value as number | string}
                                                onChange={field.onChange}
                                                onBlur={handleBlur}
                                                className="text-center px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </InputGroup>
                                    </div>
                                </>
                            )}
                        />
                    </div>

                    <div className="flex items-center gap-3 shrink-0 justify-end">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onDelete(stat.dailyGoalId)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}