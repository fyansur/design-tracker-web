import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export function DeleteStoreButton({
  storeName, onConfirm,
}: { storeName: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus "{storeName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Store akan masuk Trash dan bisa direstore nanti. Design yang nempel di store ini akan
            kehilangan referensi store-nya (tetap completed, tinggal di-assign ulang nanti).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={() => { onConfirm(); setOpen(false); }}>
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}