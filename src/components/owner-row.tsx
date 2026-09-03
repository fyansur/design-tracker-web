import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, User, Pencil, Check, X, CircleAlert } from "lucide-react";
import { ownerNameSchema, type OwnerNameForm } from "@/lib/validation";
import type { Owner } from "@/types";

export function OwnerRow({
  owner,
  onRenamed,
  onDelete,
}: {
  owner: Owner;
  onRenamed: () => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const form = useForm<OwnerNameForm>({
    resolver: zodResolver(ownerNameSchema),
    defaultValues: { name: owner.name },
  });

  function startEditing() {
    form.reset({ name: owner.name });
    setIsEditing(true);
  }

  function cancelEditing() {
    form.reset({ name: owner.name });
    setIsEditing(false);
  }

  async function handleRename(values: OwnerNameForm) {
    await api.put(`/owners/${owner.id}`, values);
    setIsEditing(false);
    onRenamed();
  }

  async function handleDelete() {
    try {
      await api.delete(`/owners/${owner.id}`);
      setDeleteError("");
      onDelete(owner.id);
    } catch {
      setDeleteError("Still has active stores — reassign first");
    }
  }

  return (
    <div className="flex flex-col gap-1 rounded-lg border px-4 py-3 bg-card">
      {isEditing ? (
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="gap-1">
                <div className="flex items-center gap-2">
                  <InputGroup className="flex-1">
                    <InputGroupAddon align="inline-start"><User className="size-3.5" /></InputGroupAddon>
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
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm truncate">{owner.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEditing}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
      {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
    </div>
  );
}