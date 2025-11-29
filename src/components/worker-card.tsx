import Link from "next/link";
import { BadgeCheck, LocateFixed, Star } from "lucide-react";

import type { Worker } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WorkerCardProps = {
  worker: Worker;
  actionLabel?: string;
  actionHref?: string;
  onAction?: (worker: Worker) => void;
  className?: string;
};

export function WorkerCard({ worker, onAction, actionHref, actionLabel = "View Profile", className }: WorkerCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">GeoMatchX Verified</p>
            <CardTitle>{worker.name}</CardTitle>
          </div>
          <div className="flex flex-col items-end text-sm text-zinc-500">
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4" />
              {worker.rating.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-400">{worker.experience}+ yrs exp.</span>
          </div>
        </div>
        <p className="text-sm text-zinc-500">{worker.headline}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            {worker.availability}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-900/80">
            ${worker.hourlyRate}/hr
          </span>
          {worker.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-300">
              {skill}
            </span>
          ))}
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{worker.bio}</p>
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
            <LocateFixed className="h-4 w-4" />
            {worker.location.city}, {worker.location.country}
          </span>
          {actionHref ? (
            <Button size="sm" asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={() => onAction?.(worker)}>
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


