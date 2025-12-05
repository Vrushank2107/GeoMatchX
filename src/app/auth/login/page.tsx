"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Welcome to GeoMatchX</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Choose your login portal</h1>
        <p className="text-sm text-zinc-500 sm:text-base">Select the portal that matches your account type</p>
      </div>
      
      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        <Link href="/auth/login-candidate" className="group">
          <div className="flex h-full flex-col items-center justify-center space-y-5 rounded-2xl border-2 border-zinc-200 bg-white/50 p-8 text-center transition hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:bg-indigo-950/20">
            <div className="rounded-full bg-indigo-100 p-5 dark:bg-indigo-900/30">
              <User className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold">Candidate Portal</h2>
            <p className="text-sm leading-relaxed text-zinc-500">
              Login as a candidate to find job opportunities and manage your profile
            </p>
            <Button className="w-full" variant="outline">
              Login as Candidate
            </Button>
          </div>
        </Link>

        <Link href="/auth/login-sme" className="group">
          <div className="flex h-full flex-col items-center justify-center space-y-5 rounded-2xl border-2 border-zinc-200 bg-white/50 p-8 text-center transition hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:bg-indigo-950/20">
            <div className="rounded-full bg-indigo-100 p-5 dark:bg-indigo-900/30">
              <Building2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold">Company Portal</h2>
            <p className="text-sm leading-relaxed text-zinc-500">
              Login as a company to post jobs and find skilled candidates
            </p>
            <Button className="w-full" variant="outline">
              Login as Company
            </Button>
          </div>
        </Link>
      </div>

      <div className="pt-4 text-center text-sm text-zinc-500">
        <p>
          Don't have an account?{" "}
          <Link href="/auth/register-candidate" className="font-medium text-indigo-500 hover:underline">
            Register as Candidate
          </Link>
          {" or "}
          <Link href="/auth/register-sme" className="font-medium text-indigo-500 hover:underline">
            Register as Company
          </Link>
        </p>
      </div>
    </div>
  );
}
