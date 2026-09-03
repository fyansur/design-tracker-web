import { useMemo, useState, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import type { Owner } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert, User, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { buildUniqueNameSchema, type UniqueNameForm } from "@/lib/validation";

export function CreateOwnerDialog({
  owners, onCreated, trigger,
}: { owners: Owner[]; onCreated: () => void; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);

  const schema = useMemo(() => buildUniqueNameSchema(owners.map((o) => o.name)), [owners]);
  const defaultValues: UniqueNameForm = { name: "" };

  const form = useForm<UniqueNameForm>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    form.reset(defaultValues);
  }

  async function onSubmit(values: UniqueNameForm) {
    try {
      await api.post("/owners", values);
      setOpen(false);
      onCreated();
    } catch {
      form.setError("name", { type: "server", message: "This name is already in use" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <div onClick={() => handleOpenChange(true)}>{trigger}</div>
      ) : (
        <Button size="icon" className="h-8 w-8" onClick={() => handleOpenChange(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      )}

      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add New Owner</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Owner Name</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><User className="size-3.5" /></InputGroupAddon>
                    <InputGroupInput aria-invalid={fieldState.invalid} autoFocus {...field} />
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