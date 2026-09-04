import { z } from "zod";

// ==================== Daily Goal target (input di card) ====================

export const dailyGoalTargetFormSchema = z.object({
  targetCount: z.coerce
    .number({ error: "Must be a number" })
    .int("Must be a whole number")
    .positive("Must be greater than 0")
    .max(1000, "Max is 1000"),
});
export type DailyGoalTargetFormInput = z.input<typeof dailyGoalTargetFormSchema>;
export type DailyGoalTargetForm = z.infer<typeof dailyGoalTargetFormSchema>;

// ==================== Unique name (Owner / Category rename & create) ====================

export function isDuplicateName(existingNames: string[], value: string, excludeName?: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (excludeName && trimmed === excludeName.trim().toLowerCase()) return false;
  return existingNames.some((n) => n.trim().toLowerCase() === trimmed);
}

export function buildUniqueNameSchema(existingNames: string[], excludeName?: string) {
  return z
    .object({
      name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
    })
    .superRefine((data, ctx) => {
      if (isDuplicateName(existingNames, data.name, excludeName)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "This name is already in use" });
      }
    });
}
export type UniqueNameForm = z.infer<ReturnType<typeof buildUniqueNameSchema>>;
export type OwnerNameForm = UniqueNameForm;
export type CategoryNameForm = UniqueNameForm;

// ==================== Store (create / edit) ====================

export const CUSTOM_OWNER_VALUE = "__custom__";

export function buildCreateStoreSchema(existingStoreNames: string[], excludeName?: string) {
  return z
    .object({
      name: z.string().min(1, "Store name is required").max(100, "Max 100 characters"),
      owner_id: z.string().optional(),
      owner_name: z.string().optional(),
      color: z.string().min(1, "Color is required"),
    })
    .superRefine((data, ctx) => {
      if (isDuplicateName(existingStoreNames, data.name, excludeName)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "This store name is already taken" });
      }
      const hasOwnerId = data.owner_id && data.owner_id !== "";
      const hasOwnerName = data.owner_name && data.owner_name.trim() !== "";
      if (!hasOwnerId && !hasOwnerName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Owner is required", path: ["owner_id"] });
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Owner is required", path: ["owner_name"] });
      }
    });
}
export type CreateStoreForm = z.infer<ReturnType<typeof buildCreateStoreSchema>>;

// ==================== Daily Goal (create dialog) ====================

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

// ==================== Campaign / Goal (create dialog) ====================

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

// ==================== Design (create / edit) ====================

export const CUSTOM_CATEGORY_VALUE = "__custom__";

export function buildCreateDesignSchema(existingCategoryNames: string[]) {
  return z
    .object({
      name: z.string().min(1, "Design title is required").max(150, "Max 150 characters"),
      storeId: z.string().optional(),
      categoryId: z.string().optional(),
      categoryName: z.string().optional(),
      referenceUrl: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (values.categoryId === CUSTOM_CATEGORY_VALUE) {
        const trimmed = values.categoryName?.trim() ?? "";
        if (!trimmed) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["categoryName"], message: "Please type a category name" });
          return;
        }
        const isDuplicate = existingCategoryNames.some((n) => n.toLowerCase() === trimmed.toLowerCase());
        if (isDuplicate) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["categoryName"], message: "Category already exists — select it from the list" });
        }
      }
      if (values.referenceUrl && values.referenceUrl.trim() !== "") {
        try {
          new URL(values.referenceUrl);
        } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["referenceUrl"], message: "Enter a valid URL" });
        }
      }
    });
}
export type CreateDesignForm = z.infer<ReturnType<typeof buildCreateDesignSchema>>;

export function buildEditStoreSchema(existingStoreNames: string[], excludeName?: string) {
  return z.object({
    name: z.string().min(1, "Store name is required").max(100, "Max 100 characters"),
    ownerId: z.string().min(1, "Owner is required"),
    color: z.string().min(1, "Color is required"),
  }).superRefine((data, ctx) => {
    if (isDuplicateName(existingStoreNames, data.name, excludeName)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "This store name is already taken" });
    }
  });
}
export type EditStoreForm = z.infer<ReturnType<typeof buildEditStoreSchema>>;

export const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
});
export type ProfileForm = z.infer<typeof profileFormSchema>;

export const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Must be at least 8 characters"),
});
export type ChangePasswordForm = z.infer<typeof changePasswordFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginForm = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmPassword"], message: "Passwords do not match" });
    }
  });
export type RegisterForm = z.infer<typeof registerFormSchema>;