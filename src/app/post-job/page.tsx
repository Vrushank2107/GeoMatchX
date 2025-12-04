"use client";

import PostJobForm from "./post-job-form";
import { AuthGuard } from "@/components/auth-guard";

export default function PostJobPage() {
  return (
    <AuthGuard requireAuth requireSME>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Job brief</p>
          <h1 className="text-3xl font-semibold">Post a new job opportunity</h1>
          <p className="text-sm text-zinc-500">
            Create a job posting to find skilled workers for your project.
          </p>
        </div>
        <PostJobForm />
      </div>
    </AuthGuard>
  );
}
