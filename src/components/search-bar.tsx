"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import type { SkillTag } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const skillOptions: SkillTag[] = ["Construction", "Plumbing", "Electrical", "Logistics", "Hospitality", "Catering", "Manufacturing"];

export type SearchFilters = {
  keyword: string;
  skill?: SkillTag;
  location?: string;
  radius: number;
};

type SearchBarProps = {
  onSubmit: (filters: SearchFilters) => void;
  isLoading?: boolean;
};

export function SearchBar({ onSubmit, isLoading }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    skill: undefined,
    location: "",
    radius: 25,
  });

  return (
    <form
      className="w-full rounded-3xl border border-zinc-200 bg-white/80 p-4 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(filters);
      }}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Keyword
          <Input
            placeholder="Operator, solar, hospitality..."
            value={filters.keyword}
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Skill
          <select
            className={cn(
              "h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white",
            )}
            value={filters.skill ?? ""}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, skill: (event.target.value as SkillTag) || undefined }))
            }
          >
            <option value="">Any skill</option>
            {skillOptions.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Location
          <Input
            placeholder="City, country..."
            value={filters.location}
            onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Radius ({filters.radius}km)
          <input
            type="range"
            min={5}
            max={250}
            value={filters.radius}
            onChange={(event) => setFilters((prev) => ({ ...prev, radius: Number(event.target.value) }))}
            className="accent-indigo-600"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1 md:flex-none">
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? "Searching..." : "Find matches"}
        </Button>
        <Button type="button" variant="ghost" className="flex-1 md:flex-none" onClick={() => setFilters({ keyword: "", skill: undefined, location: "", radius: 25 })}>
          Reset
        </Button>
        <Button type="button" variant="outline" className="flex-1 md:flex-none">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Advanced filters
        </Button>
      </div>
    </form>
  );
}


