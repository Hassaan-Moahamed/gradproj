export const DEFAULT_DEVICE_ID = "esp32-node-c";

export const SEVERITY_STYLE: Record<string, string> = {
  low: "bg-sky-100 text-sky-800 border-sky-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export const METRIC_LABEL: Record<string, string> = {
  vibration: "Vibration",
  temperature: "Temperature",
  current: "Current",
  speed: "Conveyor speed",
  detection_rate: "Detection rate",
};

export const EVENT_LABEL: Record<string, string> = {
  "incident.created": "Incident detected",
  "approval.requested": "Approval requested",
  "approval.approved": "Approved",
  "approval.rejected": "Rejected",
  "command.executed": "Command executed",
  "recovery.verified": "Recovery verified",
  "estop.triggered": "Emergency stop",
  "scenario.reset": "Scenario reset",
};

export const DEVICE_STATUS_STYLE: Record<string, string> = {
  operational: "bg-emerald-100 text-emerald-800 border-emerald-300",
  degraded: "bg-red-100 text-red-800 border-red-300",
  stopped: "bg-slate-200 text-slate-700 border-slate-400",
  offline: "bg-amber-100 text-amber-800 border-amber-300",
};

export const TWIN_FILL: Record<string, string> = {
  operational: "#10b981",
  degraded: "#ef4444",
  stopped: "#64748b",
  offline: "#f59e0b",
};