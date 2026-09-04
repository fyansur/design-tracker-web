import { useState, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Globe, Store as StoreIcon, User, Target, Tag, CalendarClock, CircleAlert } from "lucide-react";
import type { Store, Owner } from "@/types";
import { goalFormSchema, type GoalFormInput, type GoalFormValues } from "@/lib/validation";
import { toast } from "sonner";

const SCOPE_LABEL: Record<string, string> = { GLOBAL: "Global", STORE: "Store", OWNER: "Owner" };
const DURATION_LABEL: Record<string, string> = {
  daily: "Today", weekly: "A Week", monthly: "A Month", yearly: "A Year", custom: "Custom (days)",
};

export function CreateGoalDialog({
  stores, owners, onCreated, lockedStoreId, trigger,
}: { stores: Store[]; owners: Owner[]; onCreated: () => void; lockedStoreId?: number; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const defaultValues: GoalFormInput = {
    name: "",
    scope: lockedStoreId ? "STORE" : "GLOBAL",
    storeId: lockedStoreId ? String(lockedStoreId) : "",
    ownerId: "",
    targetCount: 10,
    durationType: "daily",
    durationAmount: 7,
  };

  const form = useForm<GoalFormInput, unknown, GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues,
  });

  const scope = form.watch("scope");
  const durationType = form.watch("durationType");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(defaultValues);
      setServerError("");
    }
  }

  async function onSubmit(values: GoalFormValues) {
    setServerError("");
    try {
      await api.post("/goals", {
        name: values.scope === "GLOBAL" ? values.name : undefined,
        scope: values.scope,
        storeId: values.scope === "STORE" ? Number(values.storeId) : undefined,
        ownerId: values.scope === "OWNER" ? Number(values.ownerId) : undefined,
        targetCount: values.targetCount,
        durationType: values.durationType,
        durationAmount: values.durationType === "custom" ? values.durationAmount : undefined,
      });
      toast.success("Campaign created.");
      setOpen(false);
      onCreated();
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Failed to create campaign");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <div onClick={() => handleOpenChange(true)}>{trigger}</div>
      ) : (
        <Button size="icon" className="h-6 w-6 rounded-sm" onClick={() => handleOpenChange(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      )}
      <DialogContent showCloseButton={false}>
        <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          {!lockedStoreId && (
            <Controller
              name="scope"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Scope</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><Globe /></InputGroupAddon>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                          <SelectValue>{SCOPE_LABEL[field.value]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GLOBAL">Global</SelectItem>
                          <SelectItem value="STORE">Store</SelectItem>
                          <SelectItem value="OWNER">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </InputGroup>
                    {fieldState.invalid && (
                      <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                        <CircleAlert className="size-4" />
                        <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                      </Alert>
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          )}

          {(lockedStoreId ? false : scope === "GLOBAL") && (
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Campaign Name</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><Tag /></InputGroupAddon>
                      <InputGroupInput aria-invalid={fieldState.invalid} value={field.value ?? ""} onChange={field.onChange} placeholder="Enter campaign name" />
                    </InputGroup>
                    {fieldState.invalid && (
                      <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                        <CircleAlert className="size-4" />
                        <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                      </Alert>
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          )}

          {!lockedStoreId && scope === "STORE" && (
            <Controller
              name="storeId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Store</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><StoreIcon /></InputGroupAddon>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={fieldState.invalid} className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                          <SelectValue placeholder="Select a store">
                            {stores.find((s) => String(s.id) === field.value)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </InputGroup>
                    {fieldState.invalid && (
                      <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                        <CircleAlert className="size-4" />
                        <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                      </Alert>
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          )}

          {!lockedStoreId && scope === "OWNER" && (
            <Controller
              name="ownerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Owner</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><User /></InputGroupAddon>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={fieldState.invalid} className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                          <SelectValue placeholder="Select an owner">
                            {owners.find((o) => String(o.id) === field.value)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </InputGroup>
                    {fieldState.invalid && (
                      <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                        <CircleAlert className="size-4" />
                        <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                      </Alert>
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          )}

          <Controller
            name="targetCount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Target Count</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><Target /></InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={fieldState.invalid}
                      type="number"
                      min={1}
                      value={field.value as number | string}
                      onChange={field.onChange}
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                      <CircleAlert className="size-4" />
                      <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                    </Alert>
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="durationType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Duration</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><CalendarClock /></InputGroupAddon>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                        <SelectValue>{DURATION_LABEL[field.value]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Today</SelectItem>
                        <SelectItem value="weekly">A Week</SelectItem>
                        <SelectItem value="monthly">A Month</SelectItem>
                        <SelectItem value="yearly">A Year</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </InputGroup>
                  {fieldState.invalid && (
                    <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                      <CircleAlert className="size-4" />
                      <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                    </Alert>
                  )}
                </FieldContent>
              </Field>
            )}
          />

          {durationType === "custom" && (
            <Controller
              name="durationAmount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Number of Days</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><CalendarClock /></InputGroupAddon>
                      <InputGroupInput
                        aria-invalid={fieldState.invalid}
                        type="number"
                        min={1}
                        value={field.value as number | string}
                        onChange={field.onChange}
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                        <CircleAlert className="size-4" />
                        <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                      </Alert>
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create Campaign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}