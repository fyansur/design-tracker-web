import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Store, Owner } from "@/types";
import { CreateStoreDialog } from "@/components/create-store-dialog";
import { CreateOwnerDialog } from "@/components/create-owner-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trash2, User, Pencil, Check, X } from "lucide-react";
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
      setOwnerError((prev) => ({ ...prev, [id]: "There are still active stores — reassign first" }));
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 lg:flex-row">
      {/* Stores: bagian utama */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">Stores</span>
          <CreateStoreDialog owners={owners} onCreated={loadAll} />
        </div>

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">
                      No stores yet.
                    </TableCell>
                  </TableRow>
                )}
                {stores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link to={`/stores/${s.id}`} className="flex items-center gap-2 hover:underline">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.owner?.name}</TableCell>
                    <TableCell className="text-right">
                      <DeleteStoreButton storeName={s.name} onConfirm={() => handleDeleteStore(s.id)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Owners: panel manage di samping */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">Owners</span>
          <CreateOwnerDialog onCreated={loadAll} />
        </div>
        <div className="flex flex-col gap-6">
          {owners.length === 0 && (
            <p className="text-sm text-muted-foreground">No owners yet.</p>
          )}
          {owners.map((o) => (
            <div key={o.id} className="flex flex-col gap-1 rounded-lg border px-4 py-3">
              {editingOwnerId === o.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={ownerNameDraft}
                    onChange={(e) => setOwnerNameDraft(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleRenameOwner(o.id)}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRenameOwner(o.id)}>
                    <Check className="h-4 w-4 text-chart-2" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingOwnerId(null)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{o.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => { setEditingOwnerId(o.id); setOwnerNameDraft(o.name); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteOwner(o.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
              {ownerError[o.id] && <p className="text-xs text-destructive">{ownerError[o.id]}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}