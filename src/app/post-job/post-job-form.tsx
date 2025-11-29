"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      };
      const response = await fetch("/api/mock/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to create job");
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
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Role title
          <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
        </label>
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Company
          <Input value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} required />
        </label>
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Budget signal
          <Input value={form.budget} onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))} placeholder="$55/hr or $10k / project" />
        </label>
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          City
          <Input value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} required />
        </label>
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Country
          <Input value={form.country} onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))} required />
        </label>
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Required skills (comma separated)
          <Input value={form.requiredSkills} onChange={(event) => setForm((prev) => ({ ...prev, requiredSkills: event.target.value }))} required />
        </label>
      </div>
      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
        Brief
        <Textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Operational scope, MSA requirements, travel cadence..."
          required
        />
      </label>
      <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Share brief"}
      </Button>
    </form>
  );
}


