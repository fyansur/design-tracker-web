import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Store, Owner } from "@/types";
import { CreateStoreDialog } from "@/components/create-store-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DeleteStoreButton } from "@/components/delete-store-button";

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [editingOwnerId, setEditingOwnerId] = useState<number | null>(null);
  const [ownerNameDraft, setOwnerNameDraft] = useState("");
  const [ownerError, setOwnerError] = useState<Record<number, string>>({});

  async function loadAll() {
    const [storesRes, ownersRes] = await Promise.all([
      api.get<Store[]>("/stores"),
      api.get<Owner[]>("/owners"),
    ]);
    setStores(storesRes.data);
    setOwners(ownersRes.data);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleDeleteStore(id: number) {
    await api.delete(`/stores/${id}`);
    loadAll();
  }

  async function handleRenameOwner(id: number) {
    await api.put(`/owners/${id}`, { name: ownerNameDraft });
    setEditingOwnerId(null);
    loadAll();
  }

  async function handleDeleteOwner(id: number) {
    try {
      await api.delete(`/owners/${id}`);
      setOwnerError((prev) => ({ ...prev, [id]: "" }));
      loadAll();
    } catch {
      setOwnerError((prev) => ({ ...prev, [id]: "Masih ada store aktif — reassign dulu" }));
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Stores: bagian utama */}
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Stores</h1>
          <CreateStoreDialog owners={owners} onCreated={loadAll} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Warna</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Link to={`/stores/${s.id}`} className="hover:underline">{s.name}</Link>
                </TableCell>
                <TableCell>{s.owner?.name}</TableCell>
                <TableCell>
                  <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: s.color }} />
                </TableCell>
                <TableCell className="text-right">
                  <DeleteStoreButton storeName={s.name} onConfirm={() => handleDeleteStore(s.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Owners: panel manage di samping, BUKAN aside global (itu punya Goals/stats) */}
      <Card className="w-full lg:w-80 shrink-0">
        <CardHeader><CardTitle className="text-sm">Manage Owners</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {owners.map((o) => (
            <div key={o.id} className="flex flex-col gap-1">
              {editingOwnerId === o.id ? (
                <div className="flex gap-2">
                  <Input value={ownerNameDraft} onChange={(e) => setOwnerNameDraft(e.target.value)} className="h-8" />
                  <Button size="sm" onClick={() => handleRenameOwner(o.id)}>Save</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span
                    className="cursor-pointer text-sm hover:underline"
                    onClick={() => { setEditingOwnerId(o.id); setOwnerNameDraft(o.name); }}
                  >
                    {o.name}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteOwner(o.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {ownerError[o.id] && <p className="text-xs text-destructive">{ownerError[o.id]}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}