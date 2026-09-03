import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import type { Category, Design } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

export function EditDesignDialog({
  design, categories, onUpdated,
}: { design: Design; categories: Category[]; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(design.name);
  const [categoryId, setCategoryId] = useState(design.categoryId ? String(design.categoryId) : "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [referenceUrl, setReferenceUrl] = useState(design.referenceUrl ?? "");
  const [error, setError] = useState("");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName(design.name);
      setCategoryId(design.categoryId ? String(design.categoryId) : "");
      setNewCategoryName("");
      setReferenceUrl(design.referenceUrl ?? "");
      setError("");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      let resolvedCategoryId = categoryId ? Number(categoryId) : null;

      if (!categoryId && newCategoryName.trim()) {
        const res = await api.post<Category>("/categories", { name: newCategoryName.trim() });
        resolvedCategoryId = res.data.id;
      }

      await api.put(`/designs/${design.id}`, {
        name,
        categoryId: resolvedCategoryId,
        referenceUrl: referenceUrl || null,
      });
      setOpen(false);
      onUpdated();
    } catch {
      setError("Failed to save changes");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenChange(true)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Design</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select existing category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="or type new category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Reference URL</Label>
            <Input value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} placeholder="https://..." />
          </div>

          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}