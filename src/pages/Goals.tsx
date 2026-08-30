import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/api";
import type { Goal, Store, Owner } from "../types";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"GLOBAL" | "STORE" | "OWNER">("GLOBAL");
  const [storeId, setStoreId] = useState<number | "">("");
  const [ownerId, setOwnerId] = useState<number | "">("");
  const [targetCount, setTargetCount] = useState(10);

  async function loadGoals() {
    const res = await api.get<Goal[]>("/goals");
    setGoals(res.data);
  }

  useEffect(() => {
    loadGoals();
    api.get<Store[]>("/stores").then((res) => setStores(res.data));
    api.get<Owner[]>("/owners").then((res) => setOwners(res.data));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await api.post("/goals", {
      name: scope === "GLOBAL" ? name : undefined,
      scope,
      storeId: scope === "STORE" ? storeId : undefined,
      ownerId: scope === "OWNER" ? ownerId : undefined,
      targetCount,
    });
    setName("");
    loadGoals();
  }

  async function handleDelete(id: number) {
    await api.delete(`/goals/${id}`);
    loadGoals();
  }

  return (
    <div>
      <h1>Goals</h1>
      <form onSubmit={handleSubmit}>
        <select value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}>
          <option value="GLOBAL">Global</option>
          <option value="STORE">Store</option>
          <option value="OWNER">Owner</option>
        </select>

        {scope === "GLOBAL" && (
          <input placeholder="Nama goal" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
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

        <input
          type="number"
          value={targetCount}
          onChange={(e) => setTargetCount(Number(e.target.value))}
          min={1}
        />
        <button type="submit">Buat Goal</button>
      </form>

      <ul>
        {goals.map((g) => (
          <li key={g.id}>
            {g.name} — {g.completedCount}/{g.targetCount}
            <button onClick={() => handleDelete(g.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}