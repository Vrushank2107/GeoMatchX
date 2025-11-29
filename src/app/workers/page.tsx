"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getWorkers } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { WorkerCard } from "@/components/worker-card";

export default function WorkersPage() {
  const [workers, setWorkers] = useState(getWorkers());

  useEffect(() => {
    setWorkers(getWorkers());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Verified directory</p>
          <h1 className="text-3xl font-semibold">Operators ready for activation</h1>
        </div>
        <Button asChild>
          <Link href="/post-job">Post a new brief</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {workers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} actionHref={`/workers/${worker.id}`} />
        ))}
      </div>
    </div>
  );
}


