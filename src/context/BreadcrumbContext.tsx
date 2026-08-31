import { createContext, useContext, useState, type ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string; // kalau ada href, jadi link; kalau kosong, jadi teks biasa (halaman aktif)
}

interface BreadcrumbContextType {
  items: BreadcrumbItem[] | null;
  setBreadcrumb: (items: BreadcrumbItem[] | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[] | null>(null);
  return (
    <BreadcrumbContext.Provider value={{ items, setBreadcrumb: setItems }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("useBreadcrumb harus dipakai di dalam BreadcrumbProvider");
  return ctx;
}