"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TelemetryReading } from "@/app/schema/SchemaTelemetry";

export default function LiveChart({
  series,
}: {
  series: TelemetryReading[];
}) {
  const threshold = series.at(-1)?.threshold ?? 0.6;

  const data = series.map((r) => ({
    time: format(new Date(r.timestamp), "HH:mm:ss"),
    value: r.value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Last {data.length} readings
        </CardTitle>
      </CardHeader>

      <CardContent className="h-[260px]">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Waiting for data…</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={24} />
              <YAxis domain={[0, 1.2]} tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <ReferenceLine
                y={threshold}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{ value: "threshold", fontSize: 11, fill: "#dc2626" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}