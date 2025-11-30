import { Building2, MapPin, Sparkles } from "lucide-react";

import type { Job } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type JobCardProps = {
  job: Job;
};

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center justify-between">
          {job.title}
          <span className="text-sm font-medium text-indigo-500">{job.budget}</span>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em]">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            {job.company}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location.city}, {job.location.country}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{job.description}</p>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Required skills</p>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-300"
              >
                <Sparkles className="h-3 w-3" />
                {skill}
              </span>
            ))}
          </div>
        </div>
        <Button className="w-full" variant="secondary">
          Share brief with network
        </Button>
      </CardContent>
    </Card>
  );
}


