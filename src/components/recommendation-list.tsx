import { FlameKindling, Target } from "lucide-react";

import type { Recommendation } from "@/lib/mockData";
import { Card } from "@/components/ui/card";

type RecommendationListProps = {
  recommendations: Recommendation[];
};

export function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {recommendations.map((rec) => (
        <Card key={rec.id} className="space-y-3 border-0 bg-gradient-to-b from-indigo-600 to-purple-600 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.4em] text-white/80">Smart match</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              <Target className="h-3 w-3" />
              {rec.matchScore}%
            </span>
          </div>
          <h4 className="text-xl font-semibold">{rec.candidate.name}</h4>
          <p className="text-sm text-white/80">{rec.candidate.headline}</p>
          <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-sm">
            <FlameKindling className="h-4 w-4 text-amber-300" />
            {rec.driver}
          </div>
        </Card>
      ))}
    </div>
  );
}


