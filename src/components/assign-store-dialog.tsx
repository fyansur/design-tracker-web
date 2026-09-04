import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { Design, Store, Owner } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store as StoreIcon, CircleAlert } from "lucide-react";

const assignStoreSchema = z.object({
    storeId: z.string().min(1, "Please select a store"),
});
type AssignStoreForm = z.infer<typeof assignStoreSchema>;

export function AssignStoreDialog({
    design, stores, onAssigned,
}: { design: Design; stores: Store[]; owners: Owner[]; onAssigned: () => void }) {
    const [open, setOpen] = useState(false);
    const [serverError, setServerError] = useState("");

    const availableStores = useMemo(
        () => stores.filter((s) => s.ownerId === design.ownerId),
        [stores, design.ownerId]
    );

    const form = useForm<AssignStoreForm>({
        resolver: zodResolver(assignStoreSchema),
        defaultValues: { storeId: "" },
    });

    function handleOpenChange(next: boolean) {
        setOpen(next);
        form.reset({ storeId: "" });
        setServerError("");
    }

    async function onSubmit(values: AssignStoreForm) {
        setServerError("");
        try {
            await api.put(`/designs/${design.id}`, { storeId: Number(values.storeId) });
            handleOpenChange(false);
            onAssigned();
        } catch {
            setServerError("Failed to assign store");
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button
                size="sm" variant="outline"
                className="h-7 gap-1 border-amber-500/50 text-amber-600"
                onClick={() => handleOpenChange(true)}
            >
                <StoreIcon className="h-4 w-4" /> Assign Store
            </Button>

            <DialogContent showCloseButton={false}>
                <DialogHeader><DialogTitle>Assign Store to "{design.name}"</DialogTitle></DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}
                    <Controller
                        name="storeId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldContent>
                                    <InputGroup>
                                        <InputGroupAddon align="inline-start"><StoreIcon className="size-4" /></InputGroupAddon>
                                        <Select value={field.value} onValueChange={field.onChange} disabled={availableStores.length === 0}>
                                            <SelectTrigger aria-invalid={fieldState.invalid} className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                                                <SelectValue placeholder={availableStores.length === 0 ? "No stores for this owner" : "Select store"}>
                                                    {stores.find((s) => String(s.id) === field.value)?.name}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStores.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </InputGroup>
                                    {availableStores.length === 0 && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            This design's owner doesn't have any stores yet. Create a store for them first.
                                        </p>
                                    )}
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
                        <Button type="submit">Assign</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}