import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Tag, Plus, CircleAlert } from "lucide-react";
import { CategoryRow } from "@/components/category-row";
import type { Category } from "@/types";
import { buildUniqueNameSchema, type UniqueNameForm } from "@/lib/validation";
import { toast } from "sonner";

export function CategoryManagementDialog({
    categories, onChanged,
}: { categories: Category[]; onChanged: () => void }) {
    const [open, setOpen] = useState(false);
    const [serverError, setServerError] = useState("");

    const schema = useMemo(() => buildUniqueNameSchema(categories.map((c) => c.name)), [categories]);

    const form = useForm<UniqueNameForm>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: { name: "" },
    });

    function handleOpenChange(next: boolean) {
        setOpen(next);
        form.reset({ name: "" });
        setServerError("");
    }

    async function onSubmit(values: UniqueNameForm) {
        setServerError("");
        try {
            await api.post("/categories", values);
            toast.success(`"${values.name}" added.`);
            form.reset({ name: "" });
            onChanged();
        } catch {
            setServerError("Failed to add category");
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(true)}>
                <Pencil className="size-4" /> Manage Categories
            </Button>

            <DialogContent>
                <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldContent>
                                    <div className="flex items-center gap-2">
                                        <InputGroup className="flex-1">
                                            <InputGroupAddon align="inline-start"><Tag className="size-4" /></InputGroupAddon>
                                            <InputGroupInput aria-invalid={fieldState.invalid} placeholder="New category name..." {...field} />
                                        </InputGroup>
                                        <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
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
                </form>

                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                    {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet.</p>}
                    {categories.map((c) => (
                        <CategoryRow key={c.id} category={c} categories={categories} onRenamed={onChanged} onDeleted={onChanged} />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}