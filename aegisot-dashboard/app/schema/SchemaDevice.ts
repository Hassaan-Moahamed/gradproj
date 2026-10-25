import { z } from "zod";
import { SchemaTelemetry } from "./SchemaTelemetry";

export const SchemaDevice = z.object({
  deviceId: z.string(),
  label: z.string(),
  assetId: z.string(),
  role: z.string(),
  status: z.enum(["operational", "degraded", "stopped", "offline"]),
  readings: z.array(SchemaTelemetry),
});

export const SchemaSnapshot = z.object({
  estopActive: z.boolean(),
  conveyorSpeed: z.number(),
  devices: z.array(SchemaDevice),
});

export type Device = z.infer<typeof SchemaDevice>;
export type Snapshot = z.infer<typeof SchemaSnapshot>;