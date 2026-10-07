import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JSX } from "react";

interface AnalyticsMetricData { title: string; value: string | number; icon1: JSX.Element; }

export function AnalyticsMetric({ metric }: { metric: AnalyticsMetricData }) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs font-medium">{metric.title}</CardTitle><span className="text-primary">{metric.icon1}</span></CardHeader>
      <CardContent><p className="text-2xl font-semibold">{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">No data yet</p></CardContent>
    </Card>
  );
}
