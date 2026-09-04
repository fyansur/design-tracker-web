import { useState, useMemo } from "react";
import { buildUniqueNameSchema, type CategoryNameForm, type UniqueNameForm } from "@/lib/validation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Tag, Pencil, Check, X, CircleAlert } from "lucide-react";
import type { Category } from "@/types";

export function CategoryRow({
    category, categories, onRenamed, onDeleted,
}: { category: Category; categories: Category[]; onRenamed: () => void; onDeleted: () => void }) {
    const schema = useMemo(() => buildUniqueNameSchema(categories.map((c) => c.name), category.name), [categories, category.name]);

    const form = useForm<UniqueNameForm>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: { name: category.name },
    });

    const [isEditing, setIsEditing] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    function startEditing() {
        form.reset({ name: category.name });
        setIsEditing(true);
    }
    function cancelEditing() {
        form.reset({ name: category.name });
        setIsEditing(false);
    }

    async function handleRename(values: CategoryNameForm) {
        await api.put(`/categories/${category.id}`, values);
        toast.success(`"${values.name}" renamed.`);
        setIsEditing(false);
        onRenamed();
    }

    async function handleDelete() {
        try {
            await api.delete(`/categories/${category.id}`);
            toast.success(`"${category.name}" deleted.`, {
                action: {
                    label: "Undo",
                    onClick: async () => {
                        await api.post(`/trash/category/${category.id}/restore`, {}, { suppressGlobalError: true });
                        onRenamed();
                    },
                }
            });
            setDeleteError("");
            onDeleted();
        } catch {
            setDeleteError("Failed to delete category");
        }
    }

    return (
        <div className="flex flex-col gap-1 rounded-lg border px-3 py-2">
            {isEditing ? (
                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldContent className="gap-1">
                                <div className="flex items-center gap-2">
                                    <InputGroup className="flex-1">
                                        <InputGroupAddon align="inline-start"><Tag className="size-4" /></InputGroupAddon>
                                        <InputGroupInput
                                            aria-invalid={fieldState.invalid}
                                            autoFocus
                                            {...field}
                                            onKeyDown={(e) => e.key === "Enter" && form.handleSubmit(handleRename)()}
                                        />
                                    </InputGroup>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={form.handleSubmit(handleRename)}>
                                        <Check className="h-4 w-4 text-chart-2" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEditing}>
                                        <X className="h-4 w-4 text-muted-foreground" />
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
            ) : (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEditing}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
            {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
        </div>
    );
}