"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Users, CheckCircle, UserPlus } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";

export default function SMEDashboardPage() {
  const { user, isSME } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
  });
  const [jobs, setJobs] = useState<
    Array<{
      id: string;
      title: string;
      budget: string;
      status: string;
      created_at: string;
      job_id: number;
      applications_total: number;
      applications_pending: number;
      applications_accepted: number;
    }>
  >([]);
  const [recruitments, setRecruitments] = useState<
    Array<{
      request_id: number;
      worker_id: number;
      worker_name: string;
      worker_email: string;
      status: string;
      created_at: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [jobsResponse, recruitmentsResponse] = await Promise.all([
          fetch("/api/sme/jobs"),
          fetch("/api/sme/recruitments"),
        ]);

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          const allJobs = (jobsData.jobs || []) as typeof jobs;
          setJobs(allJobs);
          setStats((prev) => ({
            ...prev,
            totalJobs: allJobs.length,
            openJobs: allJobs.filter((job) => job.status === 'OPEN').length,
          }));
        }

        if (recruitmentsResponse.ok) {
          const recData = await recruitmentsResponse.json();
          setRecruitments(recData.recruitments || []);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <AuthGuard requireAuth requireSME>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Company Dashboard</p>
          <h1 className="text-3xl font-semibold">
            Welcome back,{" "}
            <Link href="/sme/profile/edit" className="text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300">
              {user?.name || "Company"}
            </Link>
            !
          </h1>
          <p className="text-sm text-zinc-500">Manage your jobs and workforce.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <Briefcase className="h-5 w-5 text-indigo-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                    {stats.totalJobs}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">All job postings</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-green-300 dark:hover:border-green-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                    {stats.openJobs}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Active listings</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Post a Job
                  </CardTitle>
                  <CardDescription>Create a new job posting to find skilled candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/post-job">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Post New Job
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Find Candidates
                  </CardTitle>
                  <CardDescription>Search for skilled candidates by skills and location</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/search">
                      <Users className="mr-2 h-4 w-4" />
                      Search Candidates
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Active Jobs overview */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Active Jobs</h2>
                <p className="text-xs text-zinc-500">
                  {jobs.length === 0
                    ? 'No jobs posted yet. Start by creating your first brief.'
                    : `You have ${jobs.length} job${jobs.length === 1 ? '' : 's'} in your workspace.`}
                </p>
              </div>

              {jobs.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-sm text-zinc-500">
                    <p>Post a job to start receiving applications and recruitment responses.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job) => (
                    <Card key={job.id} className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                      <CardContent className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{job.title}</p>
                          <p className="text-xs text-zinc-500">
                            {job.status === 'OPEN' ? 'Open' : job.status} · {job.budget}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                          <span>
                            {job.applications_total} application{job.applications_total === 1 ? '' : 's'}
                          </span>
                          <span>
                            {job.applications_pending} pending
                          </span>
                          <span>
                            {job.applications_accepted} accepted
                          </span>
                          <Button asChild size="sm" variant="outline" className="ml-auto">
                            <Link href={`/sme/applications?job_id=${job.job_id}`}>
                              View candidates
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Recruitment requests overview */}
            <div className="space-y-3 mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-indigo-500" />
                  Recruitment Requests
                </h2>
                <p className="text-xs text-zinc-500">
                  {recruitments.length === 0
                    ? 'No recruitment requests sent yet.'
                    : `${recruitments.length} request${recruitments.length === 1 ? '' : 's'} sent to candidates.`}
                </p>
              </div>

              {recruitments.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-sm text-zinc-500">
                    <p>Use the candidate directory or search to send recruitment offers to operators.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {recruitments.slice(0, 5).map((req) => (
                    <Card key={req.request_id}>
                      <CardContent className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {req.worker_name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {req.worker_email}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-1 text-xs text-zinc-500 md:items-end">
                          <span className="uppercase tracking-wide">
                            {req.status}
                          </span>
                          <span>
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}

