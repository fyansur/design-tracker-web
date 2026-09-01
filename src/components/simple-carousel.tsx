import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SimpleCarousel({ items }: { items: ReactNode[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {items[index]}
      {items.length > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            onClick={() => setIndex((i) => (i + 1) % items.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}