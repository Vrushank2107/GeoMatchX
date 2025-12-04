"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Globe2, LayoutDashboard, Sparkles, Users2 } from "lucide-react";

import type { HomeJob, HomeRecommendation, HomeWorker } from "./page";
import type { User } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationList } from "@/components/recommendation-list";
import { WorkerCard } from "@/components/worker-card";
import { MotionSection } from "@/components/motion-section";
import { JobCard } from "@/components/job-card";
import { LoadingState } from "@/components/loading-state";
import { Building2, User as UserIcon, Briefcase, Search } from "lucide-react";

const SearchBar = dynamic(() => import("@/components/search-bar").then((mod) => mod.SearchBar), { ssr: false });
const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), { ssr: false });

type HomeClientProps = {
  workers: HomeWorker[];
  jobs: HomeJob[];
  recommendations: HomeRecommendation[];
  isLoading?: boolean;
  isAuthenticated?: boolean;
  user?: User | null;
  isWorker?: boolean;
  isSME?: boolean;
};

export default function HomeClient({ 
  workers, 
  jobs, 
  recommendations, 
  isLoading = false, 
  isAuthenticated = false,
  user,
  isWorker = false,
  isSME = false
}: HomeClientProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-16">
      {/* Hero Section with Welcome, Info, and Action */}
      <MotionSection className="rounded-3xl border border-white/40 bg-gradient-to-br from-white/95 to-white/80 p-12 shadow-2xl shadow-indigo-300/20 backdrop-blur-xl dark:from-zinc-950/95 dark:to-zinc-900/85 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
              {isSME ? (
                <>
                  <div className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-3 dark:from-indigo-900/30 dark:to-purple-900/30">
                    <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                      Welcome back, {user?.name || 'Company'}!
                    </h2>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                      Manage your workforce and find skilled operators
                    </p>
                  </div>
                </>
              ) : isWorker ? (
                <>
                  <div className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-3 dark:from-indigo-900/30 dark:to-purple-900/30">
                    <UserIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                      Welcome back, {user?.name || 'Worker'}!
                    </h2>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                      Discover opportunities and grow your career
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Website Info Section */}
          <div className="space-y-6 text-center">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-indigo-500 font-semibold mb-4">GeoMatchX</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-zinc-900 via-indigo-900 to-zinc-900 bg-clip-text text-transparent dark:from-white dark:via-indigo-200 dark:to-white mb-4">
                Deploy borderless skilled teams in days, not months.
              </h1>
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto">
                Discover verified operators, manage multi-city staffing, and launch projects with intelligence-backed
                recommendations tailored for growth markets.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-3 justify-center">
              {isAuthenticated ? (
                <>
                  {isSME ? (
                    <>
                      <Button size="lg" className="min-w-[180px] h-12 text-base" asChild>
                        <Link href="/sme/dashboard">
                          <Briefcase className="mr-2 h-5 w-5" />
                          Dashboard
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" className="min-w-[180px] h-12 text-base" asChild>
                        <Link href="/search">
                          <Search className="mr-2 h-5 w-5" />
                          Find Workers
                        </Link>
                      </Button>
                    </>
                  ) : isWorker ? (
                    <Button size="lg" className="min-w-[200px] h-12 text-base" asChild>
                      <Link href="/search">
                        <Search className="mr-2 h-5 w-5" />
                        Find Jobs
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  ) : null}
                </>
              ) : (
                <Button size="lg" className="min-w-[200px] h-12 text-base" asChild>
                  <Link href="/auth/register-sme">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Unified Visibility Section */}
      <MotionSection delay={0.1} className="rounded-3xl border border-white/40 bg-gradient-to-br from-zinc-900 via-indigo-900 to-purple-800 p-10 md:p-12 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl dark:border-zinc-800">
        <div className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Unified visibility</h2>
            <p className="text-zinc-100 text-lg max-w-2xl">
              Monitor pipeline health, operator availability, and job demand from a single command board.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/15 hover:scale-105 border border-white/10">
              <p className="text-xs uppercase tracking-[0.3em] text-white/90 font-semibold mb-3">Live briefs</p>
              <p className="text-4xl md:text-5xl font-bold text-white">38</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/15 hover:scale-105 border border-white/10">
              <p className="text-xs uppercase tracking-[0.3em] text-white/90 font-semibold mb-3">Standby crews</p>
              <p className="text-4xl md:text-5xl font-bold text-white">124</p>
            </div>
            <div className="md:col-span-2 rounded-2xl bg-white/10 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/15 border border-white/10">
              <p className="text-xs uppercase tracking-[0.3em] text-white/90 font-semibold mb-3">Priority lanes</p>
              <p className="text-2xl md:text-3xl font-bold text-white">Power, Mobility, Hospitality</p>
            </div>
          </div>
        </div>
      </MotionSection>

      <MotionSection delay={0.2} className="grid gap-6 lg:grid-cols-3">
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
          <Card key={feature.title} className="group hover:border-indigo-300 dark:hover:border-indigo-700">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 p-3 text-indigo-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 dark:from-indigo-500/10 dark:to-purple-500/10">
                {feature.icon}
              </div>
              <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </MotionSection>

      <MotionSection delay={0.3} className="space-y-6">
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


      <MotionSection delay={0.4} className="space-y-6">
        <div id="map" className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Coverage map</p>
          <h2 className="text-2xl font-semibold">Trusted crews across high-growth corridors</h2>
          <MapView workers={workers} />
        </div>
      </MotionSection>
    </div>
  );
}


