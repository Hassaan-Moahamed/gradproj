import { API_ROOT } from "@/lib/env";

export const endpoints = {
  telemetryLatest: (deviceId: string, metric?: string) => {
    const qs = new URLSearchParams({ deviceId });
    if (metric) qs.set("metric", metric);
    return `${API_ROOT}/telemetry/latest?${qs.toString()}`;
  },
  telemetrySnapshot: () => `${API_ROOT}/telemetry/snapshot`,
  openIncidents: () => `${API_ROOT}/incidents?status=open&limit=1`,
  pendingApprovals: () => `${API_ROOT}/approvals/pending`,
  decideApproval: (approvalId: string) =>
    `${API_ROOT}/approvals/${approvalId}/decide`,
  audit: (limit = 20) => `${API_ROOT}/audit?type=approval&limit=${limit}`,
  estop: () => `${API_ROOT}/commands/estop`,
  estopClear: () => `${API_ROOT}/commands/estop/clear`,
  resetScenario: () => `${API_ROOT}/reset`,
} as const;