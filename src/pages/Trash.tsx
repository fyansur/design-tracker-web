import { useEffect, useState } from "react";
import api from "../lib/api";

type TrashType = "owner" | "store" | "category" | "design" | "goal" | "daily-goal";

const TYPES: TrashType[] = ["owner", "store", "category", "design", "goal", "daily-goal"];

interface TrashItem {
  id: number;
  name?: string;
  deletedAt: string;
}

export default function Trash() {
  const [type, setType] = useState<TrashType>("design");
  const [items, setItems] = useState<TrashItem[]>([]);

  async function load() {
    const res = await api.get<TrashItem[]>(`/trash?type=${type}`);
    setItems(res.data);
  }

  useEffect(() => {
    load();
  }, [type]);

  async function handleRestore(id: number) {
    await api.post(`/trash/${type}/${id}/restore`);
    load();
  }

  async function handleHardDelete(id: number) {
    if (!confirm("Yakin hapus permanen? Ini gak bisa dibatalin.")) return;
    await api.delete(`/trash/${type}/${id}`);
    load();
  }

  return (
    <div>
      <h1>Trash</h1>

      <select value={type} onChange={(e) => setType(e.target.value as TrashType)}>
        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name ?? `#${item.id}`} — dihapus {new Date(item.deletedAt).toLocaleString()}
            <button onClick={() => handleRestore(item.id)}>Restore</button>
            <button onClick={() => handleHardDelete(item.id)}>Hapus Permanen</button>
          </li>
        ))}
      </ul>

      {items.length === 0 && <p>Trash kosong buat tipe ini.</p>}
    </div>
  );
}