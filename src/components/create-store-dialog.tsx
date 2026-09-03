import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseColor } from "react-aria-components";
import api from "@/lib/api";
import type { Owner } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ColorPicker, ColorSwatchPicker, ColorSwatchPickerItem, ColorSwatch } from "@/components/ui/color";
import { Store as StoreIcon, User, CircleAlert, Check, RotateCcw, Plus } from "lucide-react";
import { createStoreSchema, CUSTOM_OWNER_VALUE, type CreateStoreForm } from "@/lib/validation";

const PRESET_COLORS = ["#f54900", "#3b82f6", "#22c55e", "#eab308", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444"];

export function CreateStoreDialog({
  owners, onCreated,
}: { owners: Owner[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [isCustomOwnerSelected, setIsCustomOwnerSelected] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm<CreateStoreForm>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: { name: "", owner_id: "", owner_name: "", color: "#f54900" },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset({ name: "", owner_id: "", owner_name: "", color: "#f54900" });
      setIsCustomOwnerSelected(false);
      setServerError("");
    }
  }

  function handleClearOwner() {
    form.resetField("owner_id", { defaultValue: "" });
    form.resetField("owner_name", { defaultValue: "" });
    form.clearErrors("owner_id");
    form.clearErrors("owner_name");
    setIsCustomOwnerSelected(false);
  }

  async function onSubmit(values: CreateStoreForm) {
    setServerError("");
    try {
      let resolvedOwnerId = values.owner_id;

      if (!resolvedOwnerId && values.owner_name?.trim()) {
        const ownerRes = await api.post<Owner>("/owners", { name: values.owner_name.trim() });
        resolvedOwnerId = String(ownerRes.data.id);
      }

      await api.post("/stores", { name: values.name, color: values.color, ownerId: Number(resolvedOwnerId) });
      setOpen(false);
      onCreated();
    } catch {
      setServerError("Failed to add store (name might already be taken)");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button onClick={() => handleOpenChange(true)}>
        <Plus className="h-4 w-4" /> Add Store
      </Button>

      <DialogContent showCloseButton={false}>
        <DialogHeader><DialogTitle>Add New Store</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Name</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><StoreIcon/></InputGroupAddon>
                    <InputGroupAddon align="inline-start">
                      <InputGroupText>https://etsy.com/shop/</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={fieldState.invalid}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, ""))}
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

          {!isCustomOwnerSelected ? (
            <Controller
              name="owner_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Owner</FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-2">
                      <InputGroup className="flex-1">
                        <InputGroupAddon align="inline-start">
                          <InputGroupText><User className="size-4" /></InputGroupText>
                        </InputGroupAddon>
                        <Select
                          key={field.value || "empty-owner"}
                          value={field.value || undefined}
                          onValueChange={(value) => {
                            if (value === CUSTOM_OWNER_VALUE) {
                              field.onChange("");
                              setIsCustomOwnerSelected(true);
                            } else {
                              field.onChange(value);
                            }
                            form.setValue("owner_name", "", { shouldDirty: true, shouldTouch: true, shouldValidate: false });
                            form.clearErrors("owner_id");
                            form.clearErrors("owner_name");
                          }}
                        >
                          <SelectTrigger className="h-9 p-2 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                            <SelectValue aria-invalid={fieldState.invalid} placeholder="Select owner">
                              {owners.find((o) => String(o.id) === field.value)?.name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Actions</SelectLabel>
                              <SelectItem value={CUSTOM_OWNER_VALUE}>Add New Owner</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              {owners.length === 0 ? null : (
                                <>
                                  <SelectSeparator />
                                  <SelectLabel>Existing Owners</SelectLabel>
                                  {owners.map((o) => (
                                    <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </InputGroup>

                      {field.value ? (
                        <Button type="button" variant="ghost" size="icon" onClick={handleClearOwner} aria-label="Clear owner" title="Clear owner">
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
              name="owner_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Owner</FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-2">
                      <InputGroup>
                        <InputGroupAddon align="inline-start"><User className="size-4" /></InputGroupAddon>
                        <InputGroupInput
                          aria-invalid={fieldState.invalid}
                          placeholder="Type owner name..."
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </InputGroup>
                      <Button type="button" variant="ghost" size="icon" onClick={handleClearOwner} aria-label="Clear owner" title="Clear owner">
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
            name="color"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-2">
                <FieldContent className="w-full">
                  <ColorPicker
                    value={parseColor(field.value || "#f54900")}
                    onChange={(newColor) => field.onChange(newColor.toString("hex"))}
                  >
                    <ColorSwatchPicker className="w-full flex flex-row gap-2 shadow-none justify-between">
                      {PRESET_COLORS.map((color) => (
                        <ColorSwatchPickerItem
                          key={color}
                          color={color}
                          className={() => "rounded-sm ring-0 relative border-0 cursor-pointer overflow-hidden"}
                        >
                          {({ isSelected }) => (
                            <>
                              <ColorSwatch className="size-full rounded-sm" />
                              {isSelected && <Check className="absolute inset-0 m-auto size-4 text-white drop-shadow" strokeWidth={3} />}
                            </>
                          )}
                        </ColorSwatchPickerItem>
                      ))}
                    </ColorSwatchPicker>
                  </ColorPicker>
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
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}