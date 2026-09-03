import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import type { Category, Design, Store, Owner } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Image, Store as StoreIcon, Pencil, Link as LinkIcon, RotateCcw, CircleAlert } from "lucide-react";
import { buildCreateDesignSchema, CUSTOM_CATEGORY_VALUE, type CreateDesignForm } from "@/lib/validation";
import { useMemo } from "react";

export function EditDesignDialog({
  design, categories, stores, owners, onUpdated,
}: { design: Design; categories: Category[]; stores: Store[]; owners: Owner[]; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const storesByOwner = useMemo(() => {
    const groups = new Map<number, { owner: Owner; stores: Store[] }>();
    stores.forEach((store) => {
      const owner = owners.find((o) => o.id === store.ownerId);
      if (!owner) return;
      if (!groups.has(owner.id)) groups.set(owner.id, { owner, stores: [] });
      groups.get(owner.id)!.stores.push(store);
    });
    return Array.from(groups.values());
  }, [stores, owners]);

  const editDesignSchema = useMemo(
    () => buildCreateDesignSchema(categories.filter((c) => c.id !== design.categoryId).map((c) => c.name)),
    [categories, design.categoryId]
  );

  const defaultValues: CreateDesignForm = {
    name: design.name,
    storeId: design.storeId ? String(design.storeId) : "",
    categoryId: design.categoryId ? String(design.categoryId) : "",
    categoryName: "",
    referenceUrl: design.referenceUrl ?? "",
  };

  const form = useForm<CreateDesignForm>({
    resolver: zodResolver(editDesignSchema),
    defaultValues,
  });

  const selectedCategoryValue = form.watch("categoryId");
  const isCustomCategory = selectedCategoryValue === CUSTOM_CATEGORY_VALUE;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    form.reset(defaultValues);
    setServerError("");
  }

  async function onSubmit(values: CreateDesignForm) {
    setServerError("");
    try {
      let resolvedCategoryId: number | null = null;

      if (values.categoryId === CUSTOM_CATEGORY_VALUE) {
        const trimmed = values.categoryName?.trim();
        if (trimmed) {
          const res = await api.post<Category>("/categories", { name: trimmed });
          resolvedCategoryId = res.data.id;
        }
      } else if (values.categoryId) {
        resolvedCategoryId = Number(values.categoryId);
      }

      await api.put(`/designs/${design.id}`, {
        name: values.name,
        storeId: values.storeId ? Number(values.storeId) : null,
        categoryId: resolvedCategoryId,
        referenceUrl: values.referenceUrl || null,
      });
      setOpen(false);
      onUpdated();
    } catch {
      setServerError("Failed to save changes");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenChange(true)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <DialogContent>
        <DialogHeader><DialogTitle>Edit Design</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Title</FieldLabel>
                <FieldContent className="gap-0">
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><Image className="size-4" /></InputGroupAddon>
                    <InputGroupInput aria-invalid={fieldState.invalid} placeholder="Design title..." {...field} />
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
            name="storeId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Store</FieldLabel>
                <FieldContent className="gap-0">
                  <div className="flex items-center gap-2">
                    <InputGroup className="flex-1">
                      <InputGroupAddon align="inline-start"><StoreIcon className="size-4" /></InputGroupAddon>
                      <Select
                        key={field.value || "empty-store"}
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={stores.length === 0}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid} className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                          <SelectValue placeholder={stores.length === 0 ? "No stores yet" : "Select store (optional)"}>
                            {stores.find((s) => String(s.id) === field.value)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {storesByOwner.map(({ owner, stores: ownerStores }) => (
                            <SelectGroup key={owner.id}>
                              <SelectLabel>{owner.name}</SelectLabel>
                              {ownerStores.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </InputGroup>
                    {field.value ? (
                      <Button type="button" variant="ghost" size="icon" onClick={() => field.onChange("")} aria-label="Clear store">
                        <RotateCcw className="size-4" />
                      </Button>
                    ) : null}
                  </div>
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

          {!isCustomCategory ? (
            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Category</FieldLabel>
                  <FieldContent className="gap-0">
                    <div className="flex items-center gap-2">
                      <InputGroup className="flex-1">
                        <InputGroupAddon align="inline-start"><Pencil className="size-4" /></InputGroupAddon>
                        <Select
                          key={field.value || "empty-category"}
                          value={field.value || undefined}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("categoryName", "", { shouldDirty: true, shouldTouch: true, shouldValidate: false });
                            form.clearErrors("categoryName");
                          }}
                        >
                          <SelectTrigger aria-invalid={fieldState.invalid} className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                            <SelectValue placeholder="Select category (optional)">
                              {categories.find((c) => String(c.id) === field.value)?.name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Actions</SelectLabel>
                              <SelectItem value={CUSTOM_CATEGORY_VALUE}>Add new category</SelectItem>
                            </SelectGroup>
                            {categories.length > 0 && (
                              <SelectGroup>
                                <SelectSeparator />
                                <SelectLabel>Existing Categories</SelectLabel>
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                          </SelectContent>
                        </Select>
                      </InputGroup>
                      {field.value ? (
                        <Button
                          type="button" variant="ghost" size="icon"
                          onClick={() => { field.onChange(""); form.setValue("categoryName", ""); }}
                          aria-label="Clear category"
                        >
                          <RotateCcw className="size-4" />
                        </Button>
                      ) : null}
                    </div>
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
          ) : (
            <Controller
              name="categoryName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Category</FieldLabel>
                  <FieldContent className="gap-0">
                    <div className="flex items-center gap-2">
                      <InputGroup className="flex-1">
                        <InputGroupAddon align="inline-start"><Pencil className="size-4" /></InputGroupAddon>
                        <InputGroupInput aria-invalid={fieldState.invalid} placeholder="Category name..." value={field.value ?? ""} onChange={field.onChange} />
                      </InputGroup>
                      <Button
                        type="button" variant="ghost" size="icon"
                        onClick={() => { form.setValue("categoryId", ""); form.setValue("categoryName", ""); form.clearErrors("categoryName"); }}
                        aria-label="Back to category list"
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    </div>
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
            name="referenceUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>References</FieldLabel>
                <FieldContent className="gap-0">
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><LinkIcon className="size-4" /></InputGroupAddon>
                    <InputGroupInput aria-invalid={fieldState.invalid} placeholder="https://example.com" value={field.value ?? ""} onChange={field.onChange} />
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
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}