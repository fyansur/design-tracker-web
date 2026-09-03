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

export const storeNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
});
export type StoreNameForm = z.infer<typeof storeNameSchema>;

export const ownerNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
});
export type OwnerNameForm = z.infer<typeof ownerNameSchema>;

export const editStoreSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100, "Max 100 characters"),
  ownerId: z.string().min(1, "Owner is required"),
  color: z.string().min(1, "Color is required"),
});
export type EditStoreForm = z.infer<typeof editStoreSchema>; 

export const CUSTOM_OWNER_VALUE = "__custom__";

export const createStoreSchema = z
  .object({
    name: z.string().min(1, "Store name is required").max(100, "Max 100 characters"),
    owner_id: z.string().optional(),
    owner_name: z.string().optional(),
    color: z.string().min(1, "Color is required"),
  })
  .superRefine((data, ctx) => {
    const hasOwnerId = data.owner_id && data.owner_id !== "";
    const hasOwnerName = data.owner_name && data.owner_name.trim() !== "";
    if (!hasOwnerId && !hasOwnerName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Owner is required", path: ["owner_id"] });
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Owner is required", path: ["owner_name"] });
    }
  });
export type CreateStoreForm = z.infer<typeof createStoreSchema>;

export const dailyGoalFormSchema = z
  .object({
    scope: z.enum(["GLOBAL", "STORE", "OWNER"]),
    storeId: z.string().optional(),
    ownerId: z.string().optional(),
    targetCount: z.coerce
      .number({ error: "Must be a number" })
      .int("Must be a whole number")
      .positive("Must be greater than 0")
      .max(1000, "Max is 1000"),
  })
  .superRefine((data, ctx) => {
    if (data.scope === "STORE" && !data.storeId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Store is required", path: ["storeId"] });
    }
    if (data.scope === "OWNER" && !data.ownerId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Owner is required", path: ["ownerId"] });
    }
  });
export type DailyGoalFormInput = z.input<typeof dailyGoalFormSchema>;
export type DailyGoalFormValues = z.output<typeof dailyGoalFormSchema>;

export const goalFormSchema = z
  .object({
    name: z.string().optional(),
    scope: z.enum(["GLOBAL", "STORE", "OWNER"]),
    storeId: z.string().optional(),
    ownerId: z.string().optional(),
    targetCount: z.coerce
      .number({ error: "Must be a number" })
      .int("Must be a whole number")
      .positive("Must be greater than 0")
      .max(1000, "Max is 1000"),
    durationType: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]),
    durationAmount: z.coerce.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scope === "GLOBAL" && (!data.name || data.name.trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Campaign name is required", path: ["name"] });
    }
    if (data.scope === "STORE" && !data.storeId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Store is required", path: ["storeId"] });
    }
    if (data.scope === "OWNER" && !data.ownerId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Owner is required", path: ["ownerId"] });
    }
    if (data.durationType === "custom" && (!data.durationAmount || data.durationAmount <= 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter number of days", path: ["durationAmount"] });
    }
  });
export type GoalFormInput = z.input<typeof goalFormSchema>;
export type GoalFormValues = z.output<typeof goalFormSchema>;