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
        setError("Pilih owner atau isi nama owner baru");
        return;
      }

      await api.post("/stores", { name, color, ownerId: Number(resolvedOwnerId) });
      setOpen(false);
      setName("");
      setNewOwnerName("");
      setOwnerId("");
      onCreated();
    } catch {
      setError("Gagal menambahkan store (nama mungkin sudah dipakai)");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Tambah Store
      </Button>

      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Store Baru</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-col gap-2">
            <Label>Nama Store</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Warna</Label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-16 rounded border" />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Owner</Label>
            <Select value={ownerId} onValueChange={(v) => setOwnerId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Pilih owner existing" /></SelectTrigger>
              <SelectContent>
                {owners.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              placeholder="atau ketik nama owner baru"
              value={newOwnerName}
              onChange={(e) => setNewOwnerName(e.target.value)}
            />
          </div>

          <DialogFooter><Button type="submit">Simpan</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}