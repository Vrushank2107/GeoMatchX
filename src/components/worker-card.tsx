"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BadgeCheck, LocateFixed, Star, UserPlus, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-client";

export type WorkerCardWorker = {
  id: string;
  name: string;
  headline: string;
  experience: number;
  availability: string;
  hourlyRate: number;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  rating: number;
  skills: string[];
  bio: string;
};

type WorkerCardProps = {
  worker: WorkerCardWorker;
  actionLabel?: string;
  actionHref?: string;
  onAction?: (worker: Worker) => void;
  className?: string;
  showRecruitButton?: boolean;
  onRecruitSuccess?: () => void;
};

export function WorkerCard({ 
  worker, 
  onAction, 
  actionHref, 
  actionLabel = "View Profile", 
  className,
  showRecruitButton = false,
  onRecruitSuccess
}: WorkerCardProps) {
  const { isSME } = useAuth();
  const [isRecruiting, setIsRecruiting] = useState(false);
  const [recruitSuccess, setRecruitSuccess] = useState(false);
  const [hasRecruitmentRequest, setHasRecruitmentRequest] = useState(false);

  // Check recruitment status on mount and when worker changes
  useEffect(() => {
    if (showRecruitButton && isSME && worker?.id) {
      checkRecruitmentStatus();
    }
  }, [showRecruitButton, isSME, worker?.id]);

  async function checkRecruitmentStatus() {
    try {
      const response = await fetch(`/api/worker/recruitment-status?worker_id=${worker.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.hasRequest) {
          setHasRecruitmentRequest(true);
          setRecruitSuccess(true);
        }
      }
    } catch (error) {
      console.error("Error checking recruitment status:", error);
    }
  }

  async function handleRecruit() {
    setIsRecruiting(true);
    try {
      const response = await fetch("/api/sme/recruit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id: worker.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send recruitment request");
      }

      setRecruitSuccess(true);
      setHasRecruitmentRequest(true);
      if (onRecruitSuccess) {
        onRecruitSuccess();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to send recruitment request");
    } finally {
      setIsRecruiting(false);
    }
  }
  return (
    <Card className={cn("flex flex-col gap-4 group hover:scale-[1.02] transition-transform duration-300", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-medium">GeoMatchX Verified</p>
            <CardTitle className="text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{worker.name}</CardTitle>
          </div>
          <div className="flex flex-col items-end text-sm">
            <span className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="h-4 w-4 fill-amber-500" />
              {worker.rating.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-500">{worker.experience}+ yrs exp.</span>
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{worker.headline}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-50 to-indigo-100 px-3 py-1.5 text-indigo-700 font-medium shadow-sm dark:from-indigo-500/10 dark:to-indigo-500/20 dark:text-indigo-300">
            <BadgeCheck className="h-3.5 w-3.5" />
            {worker.availability}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-zinc-700 font-medium dark:bg-zinc-900/80 dark:text-zinc-300">
            ${worker.hourlyRate}/hr
          </span>
          {worker.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full bg-zinc-100 px-3 py-1.5 text-zinc-700 font-medium transition-colors hover:bg-zinc-200 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800">
              {skill}
            </span>
          ))}
          {worker.skills.length > 3 && (
            <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-zinc-500 dark:bg-zinc-900/80 dark:text-zinc-400">
              +{worker.skills.length - 3}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">{worker.bio}</p>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <LocateFixed className="h-4 w-4 text-indigo-500" />
            {worker.location.city}, {worker.location.country}
          </span>
          <div className="flex items-center gap-2">
            {showRecruitButton && (
              <>
                {recruitSuccess || hasRecruitmentRequest ? (
                  <Button size="sm" variant="outline" disabled className="shadow-sm">
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Sent
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleRecruit}
                    disabled={isRecruiting}
                    className="shadow-sm"
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    {isRecruiting ? "Sending..." : "Recruit"}
                  </Button>
                )}
              </>
            )}
            {actionHref ? (
              <Button size="sm" variant="secondary" asChild className="shadow-sm">
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => onAction?.(worker)} className="shadow-sm">
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


