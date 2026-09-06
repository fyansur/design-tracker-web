import { useState } from "react";
import api from "@/lib/api";
import type { Design, Goal } from "@/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AssignGoalPopover({
  design, goals, onAssigned,
}: { design: Design; goals: Goal[]; onAssigned: () => void }) {
  const [open, setOpen] = useState(false);

  const assignedIds = new Set((design.goals ?? []).map((dg) => dg.goal.id));

  // Cuma tawarin campaign yang scope-nya cocok sama konteks design ini, dan belum di-assign
  const availableGoals = goals.filter((g) => {
    if (assignedIds.has(g.id)) return false;
    if (g.scope === "GLOBAL") return true;
    if (g.scope === "STORE") return g.storeId === design.storeId;
    if (g.scope === "OWNER") return g.ownerId === design.ownerId;
    return false;
  });

  async function handleAssign(goalId: number) {
    try {
      await api.post(`/designs/${design.id}/goals`, { goalId }, { suppressGlobalError: true });
      toast.success("Added to campaign");
      setOpen(false);
      onAssigned();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to assign campaign");
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button variant="outline" className="h-8 gap-1 rounded-sm px-2 text-xs">
          <Plus className="h-4 w-4" /> Campaign
        </Button>
      } />
      <PopoverContent className="w-fit rounded-sm p-1" align="start">
        {availableGoals.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            No matching campaigns available.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {availableGoals.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleAssign(g.id)}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-muted"
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}