import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Store, Owner } from "@/types";
import { Plus } from "lucide-react";

export function CreateGoalDialog({
    stores, owners, onCreated, lockedStoreId,
}: { stores: Store[]; owners: Owner[]; onCreated: () => void; lockedStoreId?: number }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [scope, setScope] = useState<"GLOBAL" | "STORE" | "OWNER">(lockedStoreId ? "STORE" : "GLOBAL");
    const [storeId, setStoreId] = useState(lockedStoreId ? String(lockedStoreId) : "");
    const [ownerId, setOwnerId] = useState("");
    const [targetCount, setTargetCount] = useState(10);

    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        try {
            const resolvedScope = lockedStoreId ? "STORE" : scope;
            await api.post("/goals", {
                name: resolvedScope === "GLOBAL" ? name : undefined,
                scope: resolvedScope,
                storeId: lockedStoreId ?? (scope === "STORE" ? Number(storeId) : undefined),
                ownerId: !lockedStoreId && scope === "OWNER" ? Number(ownerId) : undefined,
                targetCount,
            });
            setOpen(false);
            setName("");
            onCreated();
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Gagal membuat campaign");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Campaign</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

                    {(lockedStoreId ? false : scope === "GLOBAL") && (
                        <div className="flex flex-col gap-2">
                            <Label>Campaign Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} required />
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
                        
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="submit">Create Campaign</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}