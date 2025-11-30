"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-client";

type FormState = {
  title: string;
  company: string;
  budget: string;
  city: string;
  country: string;
  description: string;
  requiredSkills: string;
};

const initialState: FormState = {
  title: "",
  company: "",
  budget: "",
  city: "",
  country: "",
  description: "",
  requiredSkills: "",
};

export default function PostJobForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isSME } = useAuth();
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isSME) {
      router.push("/auth/login-sme?redirect=/post-job");
    }
  }, [authLoading, isSME, router]);

  // Pre-fill company name if user is logged in
  useEffect(() => {
    if (user && isSME) {
      setForm((prev) => ({ ...prev, company: user.name }));
    }
  }, [user, isSME]);

  if (authLoading) {
    return <div className="text-center text-zinc-500">Loading...</div>;
  }

  if (!isSME) {
    return null; // Will redirect
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        company: form.company,
        budget: form.budget,
        location: {
          city: form.city,
          country: form.country,
          lat: 0,
          lng: 0,
        },
        description: form.description,
        requiredSkills: form.requiredSkills.split(",").map((skill) => skill.trim()),
        smeId: user?.id,
      };
      const response = await fetch("/api/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create job");
      }
      toast.success("Brief captured", {
        description: "Our CX desk will route it to relevant crews in the next 24 hours.",
      });
      setForm(initialState);
    } catch (error) {
      toast.error("Could not save brief", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Role title
          </label>
          <Input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
            className="h-11"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Company
          </label>
          <Input
            value={form.company}
            onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
            required
            className="h-11"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Budget signal
          </label>
          <Input
            value={form.budget}
            onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
            placeholder="$55/hr or $10k / project"
            className="h-11"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            City
          </label>
          <Input
            value={form.city}
            onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
            required
            className="h-11"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Country
          </label>
          <Input
            value={form.country}
            onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
            required
            className="h-11"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Required skills <span className="text-zinc-400">(comma separated)</span>
          </label>
          <Input
            value={form.requiredSkills}
            onChange={(event) => setForm((prev) => ({ ...prev, requiredSkills: event.target.value }))}
            required
            className="h-11"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Brief
        </label>
        <Textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Operational scope, MSA requirements, travel cadence..."
          required
          className="min-h-[120px]"
          disabled={isSubmitting}
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto h-11" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Share brief"}
      </Button>
    </form>
  );
}


