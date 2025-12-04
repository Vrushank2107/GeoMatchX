"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Users, CheckCircle } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch jobs count for this company
        const jobsResponse = await fetch("/api/sme/jobs");
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          const allJobs = jobsData.jobs || [];
          setStats(prev => ({
            ...prev,
            totalJobs: allJobs.length,
            openJobs: allJobs.filter((job: any) => job.status === 'OPEN').length,
          }));
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
                  <CardDescription>Create a new job posting to find skilled workers</CardDescription>
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
                    Find Workers
                  </CardTitle>
                  <CardDescription>Search for skilled workers by skills and location</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/search">
                      <Users className="mr-2 h-4 w-4" />
                      Search Workers
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}

