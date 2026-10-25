"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TelemetryReading } from "@/app/schema/SchemaTelemetry";
import { METRIC_LABEL } from "@/lib/constants";

export default function LiveValueCard({
  reading,
  isLoading,
}: {
  reading?: TelemetryReading;
  isLoading: boolean;
}) {
  const isCritical = reading?.status === "critical";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {METRIC_LABEL[reading?.metric ?? ""] ?? "Live reading"}
        </CardTitle>
        {reading && (
          <Badge variant={isCritical ? "destructive" : "secondary"}>
            {reading.status}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        {isLoading || !reading ? (
          <Skeleton className="h-12 w-32" />
        ) : (
          <>
            <div
              className={`text-5xl font-bold tabular-nums ${
                isCritical ? "text-red-600" : "text-foreground"
              }`}
            >
              {reading.value.toFixed(3)}
              <span className="ml-2 text-xl font-normal text-muted-foreground">
                {reading.unit}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {reading.deviceId} · {reading.assetId} · threshold{" "}
              {reading.threshold} {reading.unit}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}