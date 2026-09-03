import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { Store, Owner } from "@/types";

export function CreateDailyGoalDialog({
  stores, owners, onCreated, lockedStoreId,
}: { stores: Store[]; owners: Owner[]; onCreated: () => void; lockedStoreId?: number }) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"GLOBAL" | "STORE" | "OWNER">(lockedStoreId ? "STORE" : "GLOBAL");
  const [storeId, setStoreId] = useState(lockedStoreId ? String(lockedStoreId) : "");
  const [ownerId, setOwnerId] = useState("");
  const [targetCount, setTargetCount] = useState(5);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/daily-goals", {
        scope: lockedStoreId ? "STORE" : scope,
        storeId: lockedStoreId ?? (scope === "STORE" ? Number(storeId) : undefined),
        ownerId: !lockedStoreId && scope === "OWNER" ? Number(ownerId) : undefined,
        targetCount,
      });
      setOpen(false);
      onCreated();
    } catch {
      setError("A daily goal for this scope already exists");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Daily Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {!lockedStoreId && (
            <div className="flex flex-col gap-2">
              <Label>Scope</Label>
              <Select value={scope} onValueChange={(v) => v && setScope(v as typeof scope)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">Global</SelectItem>
                  <SelectItem value="STORE">Store</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!lockedStoreId && scope === "STORE" && (
            <div className="flex flex-col gap-2">
              <Label>Store</Label>
              <Select value={storeId} onValueChange={(v) => setStoreId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select a store" /></SelectTrigger>
                <SelectContent>
                  {stores.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {!lockedStoreId && scope === "OWNER" && (
            <div className="flex flex-col gap-2">
              <Label>Owner</Label>
              <Select value={ownerId} onValueChange={(v) => setOwnerId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger>
                <SelectContent>
                  {owners.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Target Count</Label>
            <Input type="number" min={1} value={targetCount} onChange={(e) => setTargetCount(Number(e.target.value))} />
          </div>

          <DialogFooter>
            <Button type="submit">Create Daily Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}