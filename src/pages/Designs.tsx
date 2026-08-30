import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/api";
import type { Design } from "../types";

export default function Designs() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [name, setName] = useState("");

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
            {d.name} {d.isCompleted && "✅"}
            <button onClick={() => handleDelete(d.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}