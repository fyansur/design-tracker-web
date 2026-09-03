import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseColor } from "react-aria-components";
import api from "@/lib/api";
import type { Store, Owner } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ColorPicker, ColorSwatchPicker, ColorSwatchPickerItem, ColorSwatch } from "@/components/ui/color";
import { Store as StoreIcon, User, CircleAlert, Check, Pencil } from "lucide-react";
import { editStoreSchema, type EditStoreForm } from "@/lib/validation";

const PRESET_COLORS = ["#f54900", "#3b82f6", "#22c55e", "#eab308", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444"];

export function EditStoreDialog({
    store, owners, onUpdated,
}: { store: Store; owners: Owner[]; onUpdated: () => void }) {
    const [open, setOpen] = useState(false);
    const [serverError, setServerError] = useState("");

    const form = useForm<EditStoreForm>({
        resolver: zodResolver(editStoreSchema),
        defaultValues: {
            name: store.name,
            ownerId: String(store.ownerId),
            color: store.color,
        },
    });

    function handleOpenChange(next: boolean) {
        setOpen(next);
        if (next) {
            form.reset({ name: store.name, ownerId: String(store.ownerId), color: store.color });
            setServerError("");
        }
    }

    async function onSubmit(values: EditStoreForm) {
        setServerError("");
        try {
            await api.put(`/stores/${store.id}`, {
                name: values.name,
                ownerId: Number(values.ownerId),
                color: values.color,
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
                <Pencil className="h-3.5 w-3.5" />
            </Button>

            <DialogContent showCloseButton={false}>
                <DialogHeader><DialogTitle>Edit Store</DialogTitle></DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}

                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Store Name</FieldLabel>
                                <FieldContent>
                                    <InputGroup>
                                        <InputGroupAddon align="inline-start"><StoreIcon/></InputGroupAddon>
                                        <InputGroupInput aria-invalid={fieldState.invalid} value={field.value} onChange={field.onChange} />
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
                        name="ownerId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Owner</FieldLabel>
                                <FieldContent>
                                    <InputGroup>
                                        <InputGroupAddon align="inline-start"><InputGroupText><User className="size-4" /></InputGroupText></InputGroupAddon>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger
                                                aria-invalid={fieldState.invalid}
                                                className="h-9 w-full flex-1 rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0"
                                            >
                                                <SelectValue placeholder="Select Owner">
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

                    <Controller
                        name="color"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
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
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}