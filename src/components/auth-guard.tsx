"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { Building2, User } from "lucide-react";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSME?: boolean;
  requireWorker?: boolean;
  redirectTo?: string;
};

export function AuthGuard({
  children,
  requireAuth = false,
  requireSME = false,
  requireWorker = false,
  redirectTo,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, isWorker, isSME } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  // Not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <User className="h-5 w-5" />
              You haven't registered yet
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Please register or sign in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/auth/register-worker">
                  <User className="mr-2 h-4 w-4" />
                  Register as Worker
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/register-sme">
                  <Building2 className="mr-2 h-4 w-4" />
                  Register as Company
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Require SME but user is Worker
  if (requireSME && isWorker) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Building2 className="h-5 w-5" />
              Company account required
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              This page is only available for company accounts. Please register as a company to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/auth/register-sme">
                  <Building2 className="mr-2 h-4 w-4" />
                  Register as Company
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/workers">View Worker Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Require Worker but user is SME
  if (requireWorker && isSME) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <User className="h-5 w-5" />
              Worker account required
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              This page is only available for worker accounts. Please register as a worker to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/auth/register-worker">
                  <User className="mr-2 h-4 w-4" />
                  Register as Worker
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/post-job">View Company Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

