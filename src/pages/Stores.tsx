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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { ExternalLink } from "lucide-react";
import { ownerNameSchema, type OwnerNameForm } from "@/lib/validation";
import { OwnerRow } from "@/components/owner-row";
import { EditStoreDialog } from "@/components/edit-store-dialog";

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
                  <TableHead>Designs</TableHead>
                  <TableHead>Etsy URL</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
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
                    <TableCell className="text-muted-foreground">
                      <span className="font-medium text-foreground">{s.completedCount ?? 0}</span> / {s.designCount ?? 0}
                    </TableCell>
                    <TableCell className="max-w-40 truncate">
                      <a href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{s.url}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditStoreDialog store={s} owners={owners} onUpdated={loadAll} />
                        <DeleteStoreButton storeName={s.name} onConfirm={() => handleDeleteStore(s.id)} />
                      </div>
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
        <div className="flex flex-col gap-3">
          {owners.length === 0 && (
            <p className="text-sm text-muted-foreground">No owners yet.</p>
          )}
          {owners.map((o) => (
            <OwnerRow key={o.id} owner={o} onRenamed={loadAll} onDelete={loadAll} />
          ))}
        </div>
      </div>
    </div>
  );
}