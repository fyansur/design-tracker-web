import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/api";
import type { Design, Owner } from "../types";


export default function Designs() {

    const [designs, setDesigns] = useState<Design[]>([]);
    const [name, setName] = useState("");
    const [owners, setOwners] = useState<Owner[]>([]);
    const [pendingCompleteId, setPendingCompleteId] = useState<number | null>(null);
    const [pickedOwnerId, setPickedOwnerId] = useState<number | "">("");

    async function loadDesigns() {
        const res = await api.get<Design[]>("/designs");
        setDesigns(res.data);
    }

    useEffect(() => {
        loadDesigns();
    }, []);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        await api.post("/designs", { name });
        setName("");
        loadDesigns();
    }

    async function handleDelete(id: number) {
        await api.delete(`/designs/${id}`);
        loadDesigns();
    }

    async function loadOwners() {
        const res = await api.get<Owner[]>("/owners");
        setOwners(res.data);
    }

    useEffect(() => {
        loadDesigns();
        loadOwners();
    }, []);

    async function handleToggleComplete(design: Design) {
        if (!design.isCompleted && !design.ownerId) {
            // belum punya owner — buka inline picker, jangan kirim request dulu
            setPendingCompleteId(design.id);
            return;
        }

        await api.put(`/designs/${design.id}`, { isCompleted: !design.isCompleted });
        loadDesigns();
    }

    async function handleConfirmOwnerAndComplete(designId: number) {
        if (!pickedOwnerId) return;

        await api.put(`/designs/${designId}`, { isCompleted: true, ownerId: pickedOwnerId });
        setPendingCompleteId(null);
        setPickedOwnerId("");
        loadDesigns();
    }
    return (
        <div>
            <h1>Designs</h1>
            <form onSubmit={handleSubmit}>
                <input placeholder="Nama ide" value={name} onChange={(e) => setName(e.target.value)} required />
                <button type="submit">Tambah</button>
            </form>

            <ul>
                {designs.map((d) => (
                    <li key={d.id}>
                        <input type="checkbox" checked={d.isCompleted} onChange={() => handleToggleComplete(d)} />
                        {d.name} {d.isCompleted && "✅"}

                        {pendingCompleteId === d.id && (
                            <span>
                                <select value={pickedOwnerId} onChange={(e) => setPickedOwnerId(Number(e.target.value))}>
                                    <option value="">-- pilih owner --</option>
                                    {owners.map((o) => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                                <button onClick={() => handleConfirmOwnerAndComplete(d.id)}>Confirm Complete</button>
                                <button onClick={() => setPendingCompleteId(null)}>Batal</button>
                            </span>
                        )}

                        <button onClick={() => handleDelete(d.id)}>Hapus</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}