import { Spinner } from "@/components/ui/spinner";

export function LoadingScreen() {
  return (
    <div className="flex h-full flex-1 items-center justify-center p-8">
      <Spinner className="h-8 w-8 text-muted-foreground" />
    </div>
  );
}