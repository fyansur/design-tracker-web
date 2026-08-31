import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/api";
import type { Store, Owner, DailyGoal } from "../types";


export default function DailyGoals() {
    const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [scope, setScope] = useState<"GLOBAL" | "STORE" | "OWNER">("GLOBAL");
    const [storeId, setStoreId] = useState<number | "">("");
    const [ownerId, setOwnerId] = useState<number | "">("");
    const [targetCount, setTargetCount] = useState(5);
    const [error, setError] = useState("");

    async function load() {
        const res = await api.get<DailyGoal[]>("/daily-goals");
        setDailyGoals(res.data);
    }

    useEffect(() => {
        load();
        api.get<Store[]>("/stores").then((res) => setStores(res.data));
        api.get<Owner[]>("/owners").then((res) => setOwners(res.data));
    }, []);

    function currentTarget(dg: DailyGoal) {
        const sorted = [...dg.targets].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
        return sorted[0]?.targetCount ?? null;
    }

    function displayName(dg: DailyGoal) {
        if (dg.scope === "STORE") return dg.store?.name ?? "Store";
        if (dg.scope === "OWNER") return dg.owner?.name ?? "Owner";
        return "Global";
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        try {
            await api.post("/daily-goals", {
                scope,
                storeId: scope === "STORE" ? storeId : undefined,
                ownerId: scope === "OWNER" ? ownerId : undefined,
                targetCount,
            });
            load();
        } catch {
            setError("Daily goal untuk target ini udah ada");
        }
    }

    async function handleUpdateTarget(id: number, newTarget: number) {
        await api.put(`/daily-goals/${id}/target`, { targetCount: newTarget });
        load();
    }

    async function handleDelete(id: number) {
        await api.delete(`/daily-goals/${id}`);
        load();
    }

    return (
        <div>
            <h1>Daily Goals</h1>

            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <select value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}>
                    <option value="GLOBAL">Global</option>
                    <option value="STORE">Store</option>
                    <option value="OWNER">Owner</option>
                </select>

                {scope === "STORE" && (
                    <select value={storeId} onChange={(e) => setStoreId(Number(e.target.value))} required>
                        <option value="">-- pilih store --</option>
                        {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                )}
                {scope === "OWNER" && (
                    <select value={ownerId} onChange={(e) => setOwnerId(Number(e.target.value))} required>
                        <option value="">-- pilih owner --</option>
                        {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                )}

                <input type="number" value={targetCount} onChange={(e) => setTargetCount(Number(e.target.value))} min={1} />
                <button type="submit">Buat Daily Goal</button>
            </form>

            <ul>
                {dailyGoals.map((dg) => (
                    <li key={dg.id}>
                        {displayName(dg)} — {dg.achievedToday}/{currentTarget(dg)} hari ini 
                        <button onClick={() => handleUpdateTarget(dg.id, (currentTarget(dg) ?? 0) + 1)}>+1</button>
                        <button onClick={() => handleDelete(dg.id)}>Hapus</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}