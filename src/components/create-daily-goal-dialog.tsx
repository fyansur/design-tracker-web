import { useMemo, useState, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Globe, Store as StoreIcon, User, Target, CircleAlert } from "lucide-react";
import type { Store, Owner, DailyGoalStat } from "@/types";
import { buildDailyGoalFormSchema, type DailyGoalFormInput, type DailyGoalFormValues } from "@/lib/validation";
import { toast } from "sonner";

const SCOPE_LABEL: Record<string, string> = { GLOBAL: "Global", STORE: "Store", OWNER: "Owner" };

export function CreateDailyGoalDialog({
  stores, owners, existingDailyGoals = [], onCreated, lockedStoreId, trigger,
}: {
  stores: Store[]; owners: Owner[]; existingDailyGoals?: DailyGoalStat[];
  onCreated: () => void; lockedStoreId?: number; trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const defaultValues: DailyGoalFormInput = {
    scope: lockedStoreId ? "STORE" : "GLOBAL",
    storeId: lockedStoreId ? String(lockedStoreId) : "",
    ownerId: "",
    targetCount: 5,
  };

  const schema = useMemo(
    () => buildDailyGoalFormSchema(
      existingDailyGoals.map((g) => ({
        scope: g.scope,
        storeId: g.store?.id ?? null,
        ownerId: g.owner?.id ?? null,
      }))
    ),
    [existingDailyGoals]
  );

  const form = useForm<DailyGoalFormInput, unknown, DailyGoalFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const scope = form.watch("scope");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    form.reset(defaultValues);
  }

  async function onSubmit(values: DailyGoalFormValues) {
    try {
      await api.post("/daily-goals", {
        scope: values.scope,
        storeId: values.scope === "STORE" ? Number(values.storeId) : undefined,
        ownerId: values.scope === "OWNER" ? Number(values.ownerId) : undefined,
        targetCount: values.targetCount,
      }, { suppressGlobalError: true });
      toast.success("Daily goal created");
      setOpen(false);
      onCreated();
    } catch {
      const path = values.scope === "STORE" ? "storeId" : values.scope === "OWNER" ? "ownerId" : "scope";
      form.setError(path, { type: "server", message: "A daily goal for this scope already exists" });
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
        <DialogHeader><DialogTitle>Create Daily Goal</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create Daily Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}