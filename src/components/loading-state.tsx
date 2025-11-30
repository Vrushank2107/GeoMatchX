import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  count?: number;
};

export function LoadingState({ count = 3 }: LoadingStateProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-3xl border border-zinc-100 p-4 dark:border-zinc-900/60">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}


