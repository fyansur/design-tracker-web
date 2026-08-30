import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/api";
import type { Design, Owner, Store, Category } from "../types";


export default function Designs() {

    const [stores, setStores] = useState<Store[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [storeId, setStoreId] = useState<number | "">("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [designs, setDesigns] = useState<Design[]>([]);
    const [name, setName] = useState("");
    const [owners, setOwners] = useState<Owner[]>([]);
    const [pendingCompleteId, setPendingCompleteId] = useState<number | null>(null);
    const [pickedOwnerId, setPickedOwnerId] = useState<number | "">("");

    async function loadDesigns() {
        const res = await api.get<Design[]>("/designs");
        setDesigns(res.data);
    }


    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        await api.post("/designs", {
            name,
            storeId: storeId || undefined,
            categoryId: categoryId || undefined,
        });
        setName("");
        setStoreId("");
        setCategoryId("");
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

    async function loadStores() {
        const res = await api.get<Store[]>("/stores");
        setStores(res.data);
    }
    async function loadCategories() {
        const res = await api.get<Category[]>("/categories");
        setCategories(res.data);
    }

    async function handleAssignStore(designId: number, newStoreId: number) {
        await api.put(`/designs/${designId}`, { storeId: newStoreId });
        loadDesigns();
    }
    useEffect(() => {
        loadDesigns();
        loadOwners();
        loadStores();
        loadCategories();
    }, []);
    return (
        <div>
            <h1>Designs</h1>
            <form onSubmit={handleSubmit}>
                <input placeholder="Nama ide" value={name} onChange={(e) => setName(e.target.value)} required />
                <select value={storeId} onChange={(e) => setStoreId(e.target.value ? Number(e.target.value) : "")}>
                    <option value="">-- store (opsional) --</option>
                    {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}>
                    <option value="">-- category (opsional) --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
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
                        {d.isCompleted && (
                            d.storeId ? (
                                <span> [{d.store?.name}]</span>
                            ) : (
                                <select
                                    value=""
                                    onChange={(e) => handleAssignStore(d.id, Number(e.target.value))}
                                >
                                    <option value="" disabled>⚠ Store belum di-assign</option>
                                    {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            )
                        )}
                        <button onClick={() => handleDelete(d.id)}>Hapus</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}