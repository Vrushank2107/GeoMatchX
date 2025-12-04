"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { Building2, Edit, MapPin, Phone, Mail } from "lucide-react";

type Profile = {
  name: string;
  email: string;
  phone: string | null;
  city: string;
};

export default function MyCompanyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/sme/profile");
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
    <AuthGuard requireAuth requireSME>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Company Profile</p>
            <h1 className="text-3xl font-semibold">How Workers See Your Company</h1>
            <p className="text-sm text-zinc-500">This is how your company profile appears to workers.</p>
          </div>
          <Button asChild>
            <Link href="/sme/profile/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : profile ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-500" />
                  Company Information
                </CardTitle>
                <CardDescription>Your company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-500">Company Name</label>
                  <p className="text-lg font-semibold mt-1">{profile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-500">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <p className="text-lg">{profile.email}</p>
                  </div>
                </div>
                {profile.phone && (
                  <div>
                    <label className="text-sm font-medium text-zinc-500">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-zinc-400" />
                      <p className="text-lg">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile.city && (
                  <div>
                    <label className="text-sm font-medium text-zinc-500">Location</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      <p className="text-lg">{profile.city}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Type</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium">Company Account</span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    As a company, you can post jobs, search for workers, and manage your workforce.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-zinc-500">Failed to load profile</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

