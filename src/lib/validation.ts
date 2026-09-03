import { z } from "zod";

export const dailyGoalTargetFormSchema = z.object({
  targetCount: z.coerce
    .number({ error: "Must be a number" })
    .int("Must be a whole number")
    .positive("Must be greater than 0")
    .max(1000, "Max is 1000"),
});
export type DailyGoalTargetFormInput = z.input<typeof dailyGoalTargetFormSchema>;
export type DailyGoalTargetForm = z.infer<typeof dailyGoalTargetFormSchema>; // ini = z.output