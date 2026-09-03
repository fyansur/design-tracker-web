import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { Design, Owner } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, CircleAlert } from "lucide-react";

const completeOwnerSchema = z.object({
  ownerId: z.string().min(1, "Please select an owner"),
});
type CompleteOwnerForm = z.infer<typeof completeOwnerSchema>;

export function CompleteWithOwnerDialog({
  design, owners, onClose, onCompleted,
}: { design: Design | null; owners: Owner[]; onClose: () => void; onCompleted: () => void }) {
  const [serverError, setServerError] = useState("");

  const form = useForm<CompleteOwnerForm>({
    resolver: zodResolver(completeOwnerSchema),
    defaultValues: { ownerId: "" },
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset({ ownerId: "" });
      setServerError("");
      onClose();
    }
  }

  async function onSubmit(values: CompleteOwnerForm) {
    if (!design) return;
    setServerError("");
    try {
      await api.put(`/designs/${design.id}`, { isCompleted: true, ownerId: Number(values.ownerId) });
      handleOpenChange(false);
      onCompleted();
    } catch {
      setServerError("Failed to complete design");
    }
  }

  return (
    <Dialog open={design !== null} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Select Owner Before Completing</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <Controller
            name="ownerId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldContent>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><User className="size-4" /></InputGroupAddon>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid} className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                        <SelectValue placeholder="Select owner">
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit">Confirm & Complete</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}