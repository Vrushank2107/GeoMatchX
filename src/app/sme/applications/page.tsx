"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { Briefcase, Calendar, CheckCircle, Clock, XCircle, User } from "lucide-react";

type Application = {
  application_id: number;
  job_id: number;
  job_title: string;
  worker_id: number;
  worker_name: string;
  worker_email: string;
  worker_phone: string | null;
  status: string;
  cover_letter: string | null;
  created_at: string;
};

export default function SMEApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sme/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusUpdate(applicationId: number, status: "ACCEPTED" | "REJECTED") {
    setUpdatingId(applicationId);
    try {
      const response = await fetch(`/api/sme/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update application");
      }

      // Refresh applications
      await fetchApplications();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update application");
    } finally {
      setUpdatingId(null);
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      PENDING: { variant: "secondary", icon: Clock },
      ACCEPTED: { variant: "default", icon: CheckCircle },
      REJECTED: { variant: "destructive", icon: XCircle },
    };

    const { variant, icon: Icon } = variants[status] || variants.PENDING;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  }

  return (
    <AuthGuard requireAuth requireSME>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Job Applications</p>
          <h1 className="text-3xl font-semibold">Manage Applications</h1>
          <p className="text-sm text-zinc-500">Review and respond to job applications from workers.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-lg font-semibold mb-2">No applications yet</p>
              <p className="text-sm text-zinc-500">Applications from workers will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.application_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-indigo-500" />
                        {app.job_title || "Untitled Job"}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {app.worker_name}
                        {app.worker_email && (
                          <span className="text-xs">({app.worker_email})</span>
                        )}
                      </CardDescription>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied {new Date(app.created_at).toLocaleDateString()}
                    </div>
                    {app.worker_phone && (
                      <div className="flex items-center gap-1">
                        <span>Phone: {app.worker_phone}</span>
                      </div>
                    )}
                  </div>
                  {app.cover_letter && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Cover Letter:</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{app.cover_letter}</p>
                    </div>
                  )}
                  {app.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(app.application_id, "ACCEPTED")}
                        disabled={updatingId === app.application_id}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(app.application_id, "REJECTED")}
                        disabled={updatingId === app.application_id}
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

