"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InterventionCardProps {
  title: string;
  description: string;
  roi: string;
  impact: string;
  timeframe: string;
}

export function InterventionCard({
  title,
  description,
  roi,
  impact,
  timeframe,
}: InterventionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Expected ROI</p>
              <p className="text-2xl font-bold">{roi}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Impact Level</p>
              <p className="text-2xl font-bold">{impact}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Timeframe</p>
              <p className="text-2xl font-bold">{timeframe}</p>
            </div>
          </div>
          <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Implement Intervention
          </button>
        </div>
      </CardContent>
    </Card>
  );
} 