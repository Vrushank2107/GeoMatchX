"use client";

import SearchClient from "./search-client";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Search workspace</p>
        <h1 className="text-3xl font-semibold">Find operators by skill, city, or availability</h1>
        <p className="text-sm text-zinc-500">
          Signal-based filters to surface verified talent pools ready for your next deployment.
        </p>
      </div>
      <SearchClient />
    </div>
  );
}


