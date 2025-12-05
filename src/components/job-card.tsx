"use client";

import { useState } from "react";
import { Building2, MapPin, Sparkles, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-client";

export type JobCardJob = {
  id: string;
  title: string;
  company: string;
  budget: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  requiredSkills: string[];
  description: string;
  job_id?: number;
};

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type JobCardProps = {
  job: JobCardJob;
  showApplyButton?: boolean;
  onApplySuccess?: () => void;
};

export function JobCard({ job, showApplyButton = false, onApplySuccess }: JobCardProps) {
  const { isWorker } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  async function handleApply() {
    if (!job.job_id) return;
    
    setIsApplying(true);
    try {
      const response = await fetch("/api/candidate/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.job_id,
          cover_letter: "",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to apply");
      }

      setApplied(true);
      if (onApplySuccess) {
        onApplySuccess();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to apply for job");
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center justify-between group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {job.title}
          <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">{job.budget}</span>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Building2 className="h-3.5 w-3.5" />
            {job.company}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
            <MapPin className="h-3.5 w-3.5" />
            {job.location.city}, {job.location.country}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">{job.description}</p>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Required skills</p>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:from-indigo-100 hover:to-purple-100 dark:from-indigo-500/10 dark:to-purple-500/10 dark:text-indigo-300 dark:hover:from-indigo-500/20 dark:hover:to-purple-500/20"
              >
                <Sparkles className="h-3 w-3" />
                {skill}
              </span>
            ))}
          </div>
        </div>
        {showApplyButton && isWorker ? (
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleApply}
            disabled={isApplying || applied}
          >
            {applied ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Applied
              </>
            ) : isApplying ? (
              "Applying..."
            ) : (
              "Apply for Job"
            )}
          </Button>
        ) : (
          <Button className="w-full" variant="secondary" size="lg" disabled>
            Share brief with network
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


