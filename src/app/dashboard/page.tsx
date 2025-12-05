"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle, Clock, Search, User, UserPlus } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user, isWorker } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    pending: 0,
    accepted: 0,
    recruitments: 0,
  });
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, profileRes] = await Promise.all([
          fetch("/api/candidate/stats"),
          fetch("/api/candidate/profile"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }

        if (profileRes.ok) {
          const profile = await profileRes.json();
          const fields = [
            !!profile.city,
            Array.isArray(profile.skills) && profile.skills.length > 0,
            !!profile.bio,
          ];
          const completedCount = fields.filter(Boolean).length;
          const completion = Math.round((completedCount / fields.length) * 100);
          setProfileCompletion(completion);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // Refresh stats periodically to reflect real-time updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthGuard requireAuth requireWorker>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Candidate Dashboard</p>
          <h1 className="text-3xl font-semibold">
            Welcome back,{" "}
            <Link href="/profile/edit" className="text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300">
              {user?.name || "Candidate"}
            </Link>
            !
          </h1>
          <p className="text-sm text-zinc-500">Manage your profile, applications, and job opportunities.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {profileCompletion !== null && profileCompletion < 70 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                <p className="font-semibold mb-1">Boost your visibility</p>
                <p className="mb-3">
                  Your profile is about {profileCompletion}% complete. Add your city, skills, and a short bio so companies can find you in search.
                </p>
                <Button size="sm" asChild>
                  <Link href="/profile/edit">Complete profile</Link>
                </Button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Briefcase className="h-5 w-5 text-indigo-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">{stats.applications}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">All time applications</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-amber-300 dark:hover:border-amber-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-5 w-5 text-amber-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">{stats.pending}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Awaiting response</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-green-300 dark:hover:border-green-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">{stats.accepted}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Successful applications</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-purple-300 dark:hover:border-purple-700 relative">
                {stats.recruitments > 0 && (
                  <Badge className="absolute top-2 right-2 bg-purple-600 text-white">
                    {stats.recruitments}
                  </Badge>
                )}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recruitment Offers</CardTitle>
                  <UserPlus className="h-5 w-5 text-purple-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">{stats.recruitments}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Pending offers</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">My Applications</CardTitle>
                  <CardDescription>View and manage your job applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/applications">
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Applications
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Find Jobs</CardTitle>
                  <CardDescription>Search for new job opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/search">
                      <Search className="mr-2 h-4 w-4" />
                      Search Jobs
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

