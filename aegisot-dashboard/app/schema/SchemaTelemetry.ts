import { z } from "zod";

export const MetricEnum = z.enum([
  "vibration",
  "current",
  "speed",
  "detection_rate",
]);

export const SchemaTelemetry = z.object({
  deviceId: z.string(),
  assetId: z.string(),
  metric: MetricEnum,
  value: z.number(),
  unit: z.string(),
  threshold: z.number(),
  direction: z.enum(["above", "below"]),
  status: z.enum(["normal", "warning", "critical"]),
  timestamp: z.string(),
});

export type TelemetryReading = z.infer<typeof SchemaTelemetry>;
export type Metric = z.infer<typeof MetricEnum>;