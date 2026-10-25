import { SchemaSnapshot } from "@/app/schema/SchemaDevice";
import { SchemaTelemetry } from "@/app/schema/SchemaTelemetry";
import { apiClient } from "./apiClient";
import { endpoints } from "./endpoints";

export const telemetryService = {
  getLatest: (deviceId: string, metric?: string) =>
    apiClient.get(endpoints.telemetryLatest(deviceId, metric), SchemaTelemetry),

  getSnapshot: () =>
    apiClient.get(endpoints.telemetrySnapshot(), SchemaSnapshot),
};