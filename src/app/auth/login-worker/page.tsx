"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginWorkerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      // Verify user is a worker
      if (data.user.userType !== "WORKER") {
        throw new Error("This login is for workers only. Please use the company login.");
      }

      toast.success("Login successful", {
        description: `Welcome back, ${data.user.name}!`,
      });

      // Refresh auth state and redirect to home page
      // Use window.location to ensure full page reload and auth state refresh
      window.location.href = "/";
    } catch (error) {
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Worker Portal</p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Access your workspace</h1>
        <p className="text-sm text-zinc-500 sm:text-base">Login as a worker to find job opportunities</p>
      </div>
      
      <div className="rounded-2xl border border-zinc-200 bg-white/50 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950/50 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <PasswordInput
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login as Worker"}
          </Button>
        </form>
      </div>
      
      <div className="space-y-3 text-center text-sm">
        <p className="text-zinc-500">
          Don't have an account?{" "}
          <Link href="/auth/register-worker" className="font-medium text-indigo-500 hover:underline">
            Register as Worker
          </Link>
        </p>
        <p className="text-zinc-500">
          Are you a company?{" "}
          <Link href="/auth/login-sme" className="font-medium text-indigo-500 hover:underline">
            Company Login
          </Link>
        </p>
      </div>
    </div>
  );
}

