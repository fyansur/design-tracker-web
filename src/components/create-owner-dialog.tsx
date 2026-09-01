import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function CreateOwnerDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/owners", { name });
      setOpen(false);
      setName("");
      onCreated();
    } catch {
      setError("Gagal menambahkan owner (nama mungkin sudah dipakai)");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Owner Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-2">
            <Label>Nama Owner</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <DialogFooter>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}