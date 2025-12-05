"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading-state";
import { Briefcase, Calendar, CheckCircle, Clock, XCircle, Building2, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Application = {
  application_id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  status: string;
  created_at: string;
  cover_letter?: string;
};

type Recruitment = {
  request_id: number;
  company_id: number;
  company_name: string;
  company_email: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  created_at: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingRecruitment, setUpdatingRecruitment] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Fetch both applications and recruitments
        const [appsResponse, recResponse] = await Promise.all([
          fetch("/api/candidate/applications"),
          fetch("/api/candidate/recruitments"),
        ]);
        
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApplications(appsData.applications || []);
        }
        
        if (recResponse.ok) {
          const recData = await recResponse.json();
          setRecruitments(recData.recruitments || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Refresh data every 5 seconds to get new recruitment requests
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleRecruitmentResponse(requestId: number, status: "ACCEPTED" | "REJECTED") {
    setUpdatingRecruitment(requestId);
    try {
      const response = await fetch(`/api/candidate/recruitments/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update recruitment request");
      }

      // Refresh both recruitments and applications to update the UI
      const [recResponse, appsResponse] = await Promise.all([
        fetch("/api/candidate/recruitments"),
        fetch("/api/candidate/applications"),
      ]);
      
      if (recResponse.ok) {
        const recData = await recResponse.json();
        setRecruitments(recData.recruitments || []);
      }
      
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.applications || []);
      }
    } catch (err) {
      console.error("Error updating recruitment:", err);
      alert(err instanceof Error ? err.message : "Failed to update recruitment request");
    } finally {
      setUpdatingRecruitment(null);
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      PENDING: { variant: "secondary", icon: Clock },
      ACCEPTED: { variant: "default", icon: CheckCircle },
      REJECTED: { variant: "destructive", icon: XCircle },
      WITHDRAWN: { variant: "outline", icon: XCircle },
    };

    const { variant, icon: Icon } = variants[status] || variants.PENDING;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  }

  const pendingRecruitments = recruitments.filter(r => r.status === "PENDING");

  return (
    <AuthGuard requireAuth requireWorker>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Applications & Offers</p>
          <h1 className="text-3xl font-semibold">My Applications</h1>
          <p className="text-sm text-zinc-500">Track your job applications and recruitment offers.</p>
        </div>

        {/* Recruitment Offers Section */}
        {pendingRecruitments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-500" />
                  Recruitment Offers ({pendingRecruitments.length})
                </h2>
                <p className="text-sm text-zinc-500">Companies have sent you recruitment requests</p>
              </div>
            </div>
            {pendingRecruitments.map((recruitment) => (
              <Card key={recruitment.request_id} className="border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20">
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
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      PENDING
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
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleRecruitmentResponse(recruitment.request_id, "ACCEPTED")}
                      disabled={updatingRecruitment === recruitment.request_id}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Offer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRecruitmentResponse(recruitment.request_id, "REJECTED")}
                      disabled={updatingRecruitment === recruitment.request_id}
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Job Applications Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            Job Applications ({applications.length})
          </h2>

        {isLoading ? (
          <LoadingState />
        ) : applications.length === 0 && pendingRecruitments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-lg font-semibold mb-2">No applications yet</p>
              <p className="text-sm text-zinc-500 mb-4">Start applying to jobs to see them here.</p>
              <Button asChild>
                <Link href="/search">Find Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.application_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{app.job_title || "Untitled Job"}</CardTitle>
                      <CardDescription>{app.company_name}</CardDescription>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {app.cover_letter && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Cover Letter:</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{app.cover_letter}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </AuthGuard>
  );
}

