import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/api";
import type { Category } from "../types";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  async function loadCategories() {
    const res = await api.get<Category[]>("/categories");
    setCategories(res.data);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await api.post("/categories", { name });
    setName("");
    loadCategories();
  }

  async function handleDelete(id: number) {
    await api.delete(`/categories/${id}`);
    loadCategories();
  }

  return (
    <div>
      <h1>Categories</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nama category" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit">Tambah</button>
      </form>
      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            {c.name}
            <button onClick={() => handleDelete(c.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}