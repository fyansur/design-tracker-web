import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/api";
import type { Store, Owner } from "../types";

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [ownerId, setOwnerId] = useState<number | "">("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [error, setError] = useState("");

  async function loadStores() {
    const res = await api.get<Store[]>("/stores");
    setStores(res.data);
  }

  // Belum ada GET /api/owners di backend kita — kita perlu tambahin itu
  // dulu biar dropdown ini bisa keisi. Untuk sekarang asumsikan endpoint
  // ini udah ada (kita tambahin bareng di step berikutnya kalau belum).
  async function loadOwners() {
    const res = await api.get<Owner[]>("/owners");
    setOwners(res.data);
  }

  useEffect(() => {
    loadStores();
    loadOwners();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      let resolvedOwnerId = ownerId;

      if (!resolvedOwnerId && newOwnerName.trim()) {
        const ownerRes = await api.post<Owner>("/owners", { name: newOwnerName.trim() });
        resolvedOwnerId = ownerRes.data.id;
      }

      if (!resolvedOwnerId) {
        setError("Pilih owner atau isi nama owner baru");
        return;
      }

      await api.post("/stores", { name, color, ownerId: resolvedOwnerId });
      setName("");
      setNewOwnerName("");
      setOwnerId("");
      loadStores();
      loadOwners();
    } catch {
      setError("Gagal menambahkan store");
    }
  }

  async function handleDelete(id: number) {
    await api.delete(`/stores/${id}`);
    loadStores();
  }

  return (
    <div>
      <h1>Stores</h1>

      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input placeholder="Nama store" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value ? Number(e.target.value) : "")}>
          <option value="">-- pilih owner --</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <input
          placeholder="atau ketik nama owner baru"
          value={newOwnerName}
          onChange={(e) => setNewOwnerName(e.target.value)}
        />

        <button type="submit">Tambah Store</button>
      </form>

      <ul>
        {stores.map((s) => (
          <li key={s.id} style={{ color: s.color }}>
            {s.name} — {s.owner?.name}
            <button onClick={() => handleDelete(s.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}