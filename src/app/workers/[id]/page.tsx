"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BadgeCheck, Mail, MapPin, Star, UserPlus, CheckCircle } from "lucide-react";

import { getWorkerById, type Worker } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";

export default function WorkerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isSME, isWorker, user } = useAuth();
  const id = params.id as string;
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecruiting, setIsRecruiting] = useState(false);
  const [recruitSuccess, setRecruitSuccess] = useState(false);

  // Check recruitment status on mount (non-blocking)
  useEffect(() => {
    if (isSME && id && worker) {
      checkRecruitmentStatus();
    }
  }, [isSME, id, worker]);

  async function checkRecruitmentStatus() {
    if (!worker?.id) return;
    
    try {
      const response = await fetch(`/api/worker/recruitment-status?worker_id=${worker.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.hasRequest) {
          setRecruitSuccess(true);
        }
      }
      // Silently fail - don't block page rendering
    } catch (error) {
      // Silently fail - don't block page rendering
      console.error("Error checking recruitment status:", error);
    }
  }

  useEffect(() => {
    async function fetchProfile() {
      if (!id) {
        setError("Invalid worker ID");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/profile/${id}`);
        
        if (response.status === 404) {
          setError("Worker not found");
          setIsLoading(false);
          return;
        }
        
        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          const errorMessage = errorData.error || errorData.details || `Failed to load profile (${response.status})`;
          throw new Error(errorMessage);
        }
        
        const data = (await response.json()) as Worker;
        setWorker(data);
      } catch (err) {
        console.error("Error fetching worker profile:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) {
      fetchProfile();
    }
  }, [id]);

  async function handleRecruitRequest() {
    if (!worker) return;
    
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
      // Refresh status after sending
      await checkRecruitmentStatus();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to send recruitment request");
    } finally {
      setIsRecruiting(false);
    }
  }

    return (
    <AuthGuard requireAuth>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <div className="space-y-8">
          <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/50">
            <CardContent className="pt-6">
              <p className="text-rose-600 dark:text-rose-400 font-medium">Error loading profile</p>
              <p className="text-sm text-rose-500 dark:text-rose-500 mt-2">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : !worker ? (
        <div className="space-y-8">
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
            <CardContent className="pt-6">
              <p className="text-amber-600 dark:text-amber-400 font-medium">Worker not found</p>
              <p className="text-sm text-amber-500 dark:text-amber-500 mt-2">
                The worker profile you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">GeoMatchX verified</p>
            <h1 className="text-3xl font-semibold">{worker.name}</h1>
            <p className="text-sm text-zinc-500">{worker.headline}</p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-indigo-50 px-4 py-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
            <Star className="h-4 w-4" />
            {worker.rating.toFixed(1)} · {worker.experience}+ yrs
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
            <MapPin className="h-4 w-4" />
            {worker.location.city}, {worker.location.country}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
            Availability: {worker.availability}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
            Rate: ${worker.hourlyRate}/hr
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <section>
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{worker.bio}</p>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-zinc-500">Core skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {worker.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-sm text-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200">
                    <BadgeCheck className="h-4 w-4 text-indigo-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-semibold">Engage this operator</h2>
            {isSME ? (
              <>
                <p className="text-sm text-zinc-500">Send a recruitment request to this worker. They will be notified and can respond to your offer.</p>
                {recruitSuccess ? (
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/50">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Recruitment request sent successfully!</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      The worker has been notified and will respond soon.
                    </p>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleRecruitRequest}
                    disabled={isRecruiting}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isRecruiting ? "Sending request..." : "Send Request to Recruit"}
                  </Button>
                )}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-2">Or contact directly:</p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`mailto:${worker.email || 'cx@geomatchx.com'}`}>
                      Contact {worker.name}
                      <Mail className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-zinc-500">Share project context, mobilization date, and budget guardrails. Our CX team will coordinate within 24h.</p>
                <Button className="w-full" asChild>
                  <a href="mailto:cx@geomatchx.com">
                    Contact deployment desk
                    <Mail className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
      )}
    </AuthGuard>
  );
}


