"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function RegisterWorkerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    skillFocus: "",
    city: "",
    experienceSummary: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Server returned an invalid response. Please try again.");
      }

      if (!response.ok) {
        const errorMessage = data?.error || `Registration failed (${response.status})`;
        console.error("Registration error:", errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account created successfully", {
        description: "Welcome to GeoMatchX! Your profile is being set up.",
      });

      // Small delay to show toast before redirect
      setTimeout(() => {
        // Send newly registered workers to complete their profile
        router.push("/profile/edit");
      }, 500);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Operator onboarding</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Join GeoMatchX</h1>
        <p className="text-sm text-zinc-500 sm:text-base">Share your experience summary and availability. A CX partner will verify your credentials.</p>
      </div>
      
      <div className="rounded-2xl border border-zinc-200 bg-white/50 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950/50 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Full name
          </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password <span className="text-zinc-400 text-xs">(min. 8 characters)</span>
              </label>
              <PasswordInput
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
              />
              {formData.password && formData.password.length < 8 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phone <span className="text-zinc-400">(optional)</span>
          </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Skill focus
          </label>
              <Input
                placeholder="Electrical, Hospitality..."
                required
                value={formData.skillFocus}
                onChange={(e) => setFormData({ ...formData, skillFocus: e.target.value })}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            City
          </label>
              <Input
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={isLoading}
                className="h-11"
              />
            </div>
        </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Experience summary
        </label>
            <Textarea
              placeholder="Highlight projects and certifications..."
              value={formData.experienceSummary}
              onChange={(e) => setFormData({ ...formData, experienceSummary: e.target.value })}
              disabled={isLoading}
              className="min-h-[120px]"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Submit profile"}
        </Button>
      </form>
      </div>
    </div>
  );
}


