import { z } from "zod";

export const SchemaIncident = z.object({
  incidentId: z.string(),
  deviceId: z.string(),
  assetId: z.string(),
  metric: z.string(),
  observedValue: z.number(),
  threshold: z.number(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "awaiting_approval", "resolved"]),
  summary: z.string(),
  recommendedAction: z.object({
    code: z.string(),
    label: z.string(),
  }),
  confidence: z.number(),
  modelVersion: z.string(),
  detectedAt: z.string(),
});

export const SchemaIncidentList = z.object({
  data: z.array(SchemaIncident),
});

export type Incident = z.infer<typeof SchemaIncident>;