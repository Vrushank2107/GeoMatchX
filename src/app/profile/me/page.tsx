"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Edit, Mail, MapPin, Phone, Star } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";

type Profile = {
  name: string;
  email: string;
  phone: string | null;
  city: string;
  skills: string[];
  experience: number;
  bio: string;
  rating: number;
};

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/candidate/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return (
    <AuthGuard requireAuth requireWorker>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">My Profile</p>
            <h1 className="text-3xl font-semibold">How Employers See You</h1>
            <p className="text-sm text-zinc-500">This is how your profile appears to companies.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile/change-password">
                Change Password
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : profile ? (
          <>
            <Card className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">GeoMatchX verified</p>
                  <h1 className="text-3xl font-semibold">{profile.name}</h1>
                  <p className="text-sm text-zinc-500">
                    {profile.skills.length > 0
                      ? `${profile.skills[0]} specialist`
                      : "Available candidate"}
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-indigo-50 px-4 py-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                  <Star className="h-4 w-4" />
                  {profile.rating.toFixed(1)} · {profile.experience}+ yrs
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                  <MapPin className="h-4 w-4" />
                  {profile.city || "Unknown"}
                </span>
                {profile.phone && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </span>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <section>
                    <h2 className="text-lg font-semibold">About</h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {profile.bio || "No bio available."}
                    </p>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold text-zinc-500">Core skills</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.skills.length > 0 ? (
                        profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-sm text-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200"
                          >
                            <BadgeCheck className="h-4 w-4 text-indigo-500" />
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500">No skills added yet.</p>
                      )}
                    </div>
                  </section>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 pt-6">
                  <h2 className="text-lg font-semibold">Profile Status</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Profile completeness</span>
                      <span className="font-semibold">
                        {Math.round(
                          ((profile.name ? 1 : 0) +
                            (profile.email ? 1 : 0) +
                            (profile.phone ? 1 : 0) +
                            (profile.city ? 1 : 0) +
                            (profile.skills.length > 0 ? 1 : 0) +
                            (profile.bio ? 1 : 0)) /
                            6 *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Skills listed</span>
                      <span className="font-semibold">{profile.skills.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Experience</span>
                      <span className="font-semibold">{profile.experience} years</span>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link href="/profile/edit">Complete Your Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-zinc-500">Failed to load profile.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

