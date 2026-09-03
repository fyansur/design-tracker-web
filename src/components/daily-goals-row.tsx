import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Trash2, Globe, Store, User } from "lucide-react";
import { dailyGoalTargetFormSchema, type DailyGoalTargetFormInput, type DailyGoalTargetForm } from "@/lib/validation";
import type { DailyGoalStat } from "@/types";

export function DailyGoalRow({
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
        <div className="flex items-center justify-between gap-2 py-1.5 text-sm border-b last:border-0">
            <div className="flex items-center gap-1.5 min-w-0">
                <ScopeIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{stat.scope !== "GLOBAL" ? stat.displayName : "Global"}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <span className={isAchievedToday ? "font-medium text-chart-2" : "text-muted-foreground"}>
                    {stat.achievedToday}
                </span>
                <span className="text-muted-foreground">/</span>

                <Controller
                    name="targetCount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="w-10">
                            <FieldContent className="gap-0">
                                <InputGroup>
                                    <InputGroupInput
                                        aria-invalid={fieldState.invalid}
                                        type="number"
                                        min={1}
                                        value={field.value as number | string}
                                        onChange={field.onChange}
                                        onBlur={handleBlur}
                                        className="text-center text-xs px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </InputGroup>
                            </FieldContent>
                        </Field>
                    )}
                />

                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(stat.dailyGoalId)}>
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}