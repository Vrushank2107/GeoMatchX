"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { AuthGuard } from "@/components/auth-guard";
import { Badge } from "@/components/ui/badge";

type Recruitment = {
  request_id: number;
  company_id: number;
  company_name: string;
  company_email: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  created_at: string;
};

export default function RecruitmentsPage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchRecruitments();
  }, []);

  async function fetchRecruitments() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/worker/recruitments");
      if (!response.ok) {
        throw new Error("Failed to fetch recruitments");
      }
      const data = await response.json();
      setRecruitments(data.recruitments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResponse(requestId: number, status: "ACCEPTED" | "REJECTED") {
    setUpdating(requestId);
    try {
      const response = await fetch(`/api/worker/recruitments/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update recruitment request");
      }

      // Refresh the list
      await fetchRecruitments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update recruitment request");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <AuthGuard requireAuth requireWorker>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Recruitment Offers</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            View and manage recruitment requests from companies
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/50">
            <CardContent className="pt-6">
              <p className="text-rose-600 dark:text-rose-400">{error}</p>
            </CardContent>
          </Card>
        ) : recruitments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Building2 className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">
                No recruitment offers yet. Companies will send you offers here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {recruitments.map((recruitment) => (
              <Card key={recruitment.request_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-indigo-500" />
                        {recruitment.company_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(recruitment.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        recruitment.status === "ACCEPTED"
                          ? "default"
                          : recruitment.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {recruitment.status === "PENDING" && (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {recruitment.status === "ACCEPTED" && (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      )}
                      {recruitment.status === "REJECTED" && (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {recruitment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${recruitment.company_email}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {recruitment.company_email}
                    </a>
                  </div>
                  {recruitment.status === "PENDING" && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleResponse(recruitment.request_id, "ACCEPTED")}
                        disabled={updating === recruitment.request_id}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleResponse(recruitment.request_id, "REJECTED")}
                        disabled={updating === recruitment.request_id}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

