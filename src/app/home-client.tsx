"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Globe2, LayoutDashboard, Sparkles, Users2 } from "lucide-react";

import type { Job, Recommendation, Worker } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationList } from "@/components/recommendation-list";
import { WorkerCard } from "@/components/worker-card";
import { MotionSection } from "@/components/motion-section";
import { JobCard } from "@/components/job-card";
import { LoadingState } from "@/components/loading-state";

const SearchBar = dynamic(() => import("@/components/search-bar").then((mod) => mod.SearchBar), { ssr: false });
const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), { ssr: false });

type HomeClientProps = {
  workers: Worker[];
  jobs: Job[];
  recommendations: Recommendation[];
  isLoading?: boolean;
  isAuthenticated?: boolean;
};

export default function HomeClient({ workers, jobs, recommendations, isLoading = false, isAuthenticated = false }: HomeClientProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-20">
      <MotionSection className="grid gap-10 rounded-[40px] border border-white/40 bg-white/70 p-10 shadow-2xl shadow-indigo-300/20 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">GeoMatchX</p>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-white lg:text-5xl">
            Deploy borderless skilled teams in days, not months.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            Discover verified operators, manage multi-city staffing, and launch projects with intelligence-backed
            recommendations tailored for growth markets.
          </p>
          <div className="flex flex-wrap gap-3">
            {isAuthenticated ? (
              <>
                <Button size="lg" className="min-w-[180px]" asChild>
                  <Link href="/post-job">
                    Launch a project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="min-w-[180px]" asChild>
                  <a href="#map">Explore coverage</a>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="min-w-[180px]" asChild>
                  <Link href="/auth/register-sme">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="min-w-[180px]" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
          <dl className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Operators in-network", value: "4.2k+" },
              { label: "Avg. match speed", value: "36 hrs" },
              { label: "Active markets", value: "27" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/40 bg-white/50 p-4 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <dt className="text-xs uppercase tracking-[0.3em] text-indigo-500">{item.label}</dt>
                <dd className="mt-2 text-2xl font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-6">
          {isAuthenticated ? (
            <SearchBar onSubmit={() => {}} />
          ) : (
            <Card className="border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">Discover Skilled Workers</CardTitle>
                <CardDescription>
                  Search by skill, location, or availability to find the perfect match for your project.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <Link href="/auth/login" className="font-medium text-indigo-500 hover:underline">
                    Sign in
                  </Link>
                  {" or "}
                  <Link href="/auth/register-worker" className="font-medium text-indigo-500 hover:underline">
                    register
                  </Link>
                  {" to search for workers and access all features."}
                </p>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/auth/register-sme">Get Started as Company</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="border-0 bg-gradient-to-br from-zinc-900 via-indigo-900 to-purple-800 text-white shadow-2xl">
            <CardHeader>
              <CardTitle>Unified visibility</CardTitle>
              <CardDescription className="text-zinc-100">
                Monitor pipeline health, operator availability, and job demand from a single command board.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Live briefs</p>
                <p className="mt-2 text-2xl font-semibold">38</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Standby crews</p>
                <p className="mt-2 text-2xl font-semibold">124</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Priority lanes</p>
                <p className="mt-2 text-2xl font-semibold">Power, Mobility, Hospitality</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MotionSection>

      <MotionSection delay={0.1} className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Global-ready network",
            description: "Verified pros across Africa, LATAM, and SEA with compliance-ready credentials.",
            icon: <Globe2 className="h-5 w-5 text-indigo-500" />,
          },
          {
            title: "Realtime intelligence",
            description: "Ranking logic blends skills, mission history, geography, and reliability scores.",
            icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
          },
          {
            title: "Ops cockpit",
            description: "Track engagements, workforce readiness, and cross-border payouts in one hub.",
            icon: <LayoutDashboard className="h-5 w-5 text-indigo-500" />,
          },
        ].map((feature) => (
          <Card key={feature.title}>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-full bg-indigo-50 p-3 text-indigo-500 dark:bg-indigo-500/10">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </MotionSection>

      <MotionSection delay={0.2} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Live talent radar</p>
            <h2 className="text-2xl font-semibold">Top operators ready to deploy</h2>
          </div>
          {isAuthenticated ? (
            <Button variant="outline" asChild>
              <Link href="/workers">
                Browse directory
                <Users2 className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/auth/register-worker">
                Join as Worker
                <Users2 className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {workers.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {workers.slice(0, 3).map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-500">
              {isAuthenticated 
                ? "No workers available at the moment." 
                : "Sign in to view available workers."}
            </p>
          </div>
        )}
      </MotionSection>

      {isAuthenticated && (
        <MotionSection delay={0.3} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Smart recommendations</p>
              <h2 className="text-2xl font-semibold">Signal-based routing for your briefs</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/recommendations">View playbook</Link>
            </Button>
          </div>
          {recommendations.length > 0 ? (
            <RecommendationList recommendations={recommendations} />
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-500">No recommendations available yet.</p>
            </div>
          )}
        </MotionSection>
      )}

      <MotionSection delay={0.4} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div id="map" className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Coverage map</p>
          <h2 className="text-2xl font-semibold">Trusted crews across high-growth corridors</h2>
          <MapView workers={workers} />
        </div>
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-zinc-500">
                  {isAuthenticated 
                    ? "No active job postings at the moment." 
                    : "Sign in to view and post jobs."}
                </p>
              </CardContent>
            </Card>
          )}
          {isAuthenticated ? (
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/post-job">Submit a brief</Link>
            </Button>
          ) : (
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/auth/register-sme">Get Started as Company</Link>
            </Button>
          )}
        </div>
      </MotionSection>
    </div>
  );
}


