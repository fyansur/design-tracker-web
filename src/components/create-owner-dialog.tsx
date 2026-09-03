import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert, User, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ownerNameSchema, type OwnerNameForm } from "@/lib/validation";

export function CreateOwnerDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const defaultValues: OwnerNameForm = { name: "" };

  const form = useForm<OwnerNameForm>({
    resolver: zodResolver(ownerNameSchema),
    defaultValues,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    form.reset(defaultValues);
    setServerError("");
  }

  async function onSubmit(values: OwnerNameForm) {
    setServerError("");
    try {
      await api.post("/owners", values);
      setOpen(false);
      onCreated();
    } catch {
      setServerError("Failed to add owner (name may already be in use)");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button size="icon" className="h-8 w-8" onClick={() => handleOpenChange(true)}>
        <Plus className="h-4 w-4" />
      </Button>

      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add New Owner</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

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