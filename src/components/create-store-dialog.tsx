import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import type { Owner } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function CreateStoreDialog({
  owners, onCreated,
}: { owners: Owner[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [ownerId, setOwnerId] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      let resolvedOwnerId = ownerId;

      if (!resolvedOwnerId && newOwnerName.trim()) {
        const ownerRes = await api.post<Owner>("/owners", { name: newOwnerName.trim() });
        resolvedOwnerId = String(ownerRes.data.id);
      }
      if (!resolvedOwnerId) {
        setError("Select an owner or enter a new owner name");
        return;
      }

      await api.post("/stores", { name, color, ownerId: Number(resolvedOwnerId) });
      setOpen(false);
      setName("");
      setNewOwnerName("");
      setOwnerId("");
      onCreated();
    } catch {
      setError("Failed to add store (name might already be taken)");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Store
      </Button>

      <DialogContent>
        <DialogHeader><DialogTitle>Add New Store</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-col gap-2">
            <Label>Store Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Color</Label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-16 rounded border" />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Owner</Label>
            <Select value={ownerId} onValueChange={(v) => setOwnerId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select existing owner" /></SelectTrigger>
              <SelectContent>
                {owners.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              placeholder="or type new owner name"
              value={newOwnerName}
              onChange={(e) => setNewOwnerName(e.target.value)}
            />
          </div>

          <DialogFooter><Button type="submit">Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}