/* ---------- Types ---------- */

export type Metric = "vibration" | "current" | "speed" | "detection_rate";
export type DeviceStatus = "operational" | "degraded" | "stopped" | "offline";

type MetricConfig = {
  metric: Metric;
  unit: string;
  normal: number;
  fault: number;
  threshold: number;
  direction: "above" | "below";
  jitter: number;
  decimals: number;
};

type DeviceConfig = {
  deviceId: string;
  label: string;
  assetId: string;
  role: string;
  primaryMetric: Metric;
  metrics: MetricConfig[];
};

/* ---------- Factory layout ---------- */

export const DEVICES: DeviceConfig[] = [
  {
    deviceId: "esp32-node-a",
    label: "Camera Node",
    assetId: "line1-stationA",
    role: "Camera / Detection",
    primaryMetric: "detection_rate",
    metrics: [
      {
        metric: "detection_rate",
        unit: "%",
        normal: 98.5,
        fault: 96.4,
        threshold: 95,
        direction: "below",
        jitter: 0.6,
        decimals: 1,
      },
    ],
  },
  {
    deviceId: "esp32-node-b",
    label: "Conveyor Node",
    assetId: "line1-conveyor",
    role: "Conveyor & E-Stop",
    primaryMetric: "speed",
    metrics: [
      {
        metric: "speed",
        unit: "%",
        normal: 100,
        fault: 100,
        threshold: 120,
        direction: "above",
        jitter: 0.8,
        decimals: 0,
      },
    ],
  },
  {
    deviceId: "esp32-node-c",
    label: "Vibration Node",
    assetId: "line1-stationB",
    role: "ADXL345 / INA219",
    primaryMetric: "vibration",
    metrics: [
      {
        metric: "vibration",
        unit: "g",
        normal: 0.28,
        fault: 0.85,
        threshold: 0.6,
        direction: "above",
        jitter: 0.04,
        decimals: 3,
      },
      {
        metric: "current",
        unit: "A",
        normal: 2.1,
        fault: 3.4,
        threshold: 3.0,
        direction: "above",
        jitter: 0.08,
        decimals: 2,
      },
    ],
  },
];

export const FAULT_AFTER_MS = 20_000;
const FAULT_DEVICE = "esp32-node-c";

/* ---------- Store ---------- */

type Incident = {
  incidentId: string;
  deviceId: string;
  assetId: string;
  metric: Metric;
  observedValue: number;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  status: "awaiting_approval" | "resolved" | "rejected";
  summary: string;
  confidence: number;
  modelVersion: string;
  recommendedAction: { code: string; label: string };
  detectedAt: string;
};

type Approval = {
  approvalId: string;
  incidentId: string;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  action: { code: string; label: string };
};

type AuditEvent = {
  auditId: string;
  timestamp: string;
  eventType: string;
  actor: string;
  actorRole: string;
  reason: string | null;
  result: "success" | "failure";
};

type Store = {
  startedAt: number;
  resolved: boolean;
  estopActive: boolean;
  conveyorSpeed: number;
  incidents: Incident[];
  approvals: Approval[];
  audit: AuditEvent[];
  counters: Record<string, number>;
};

function fresh(): Store {
  return {
    startedAt: Date.now(),
    resolved: false,
    estopActive: false,
    conveyorSpeed: 100,
    incidents: [],
    approvals: [],
    audit: [],
    counters: { INC: 0, APR: 0, AUD: 0 },
  };
}

const g = globalThis as unknown as { __aegisStore?: Store };
if (!g.__aegisStore) g.__aegisStore = fresh();
const store = () => g.__aegisStore!;

function nextId(prefix: "INC" | "APR" | "AUD") {
  const s = store();
  s.counters[prefix] += 1;
  return `${prefix}-${String(s.counters[prefix]).padStart(4, "0")}`;
}

function log(
  eventType: string,
  actor: string,
  actorRole: string,
  reason: string | null = null,
  result: "success" | "failure" = "success"
) {
  store().audit.unshift({
    auditId: nextId("AUD"),
    timestamp: new Date().toISOString(),
    eventType,
    actor,
    actorRole,
    reason,
    result,
  });
}

/* ---------- Phase ---------- */

function inFault() {
  const s = store();
  if (s.estopActive || s.resolved) return false;
  return Date.now() - s.startedAt >= FAULT_AFTER_MS;
}

/* ---------- Readings ---------- */

function round(n: number, d: number) {
  return Number(n.toFixed(d));
}

function readingFor(dev: DeviceConfig, cfg: MetricConfig) {
  const s = store();

  let value: number;

  if (s.estopActive) {
    value = 0;
  } else if (cfg.metric === "speed") {
    value = round(s.conveyorSpeed + (Math.random() - 0.5) * cfg.jitter, cfg.decimals);
  } else {
    const base = inFault() ? cfg.fault : cfg.normal;
    value = round(base + (Math.random() - 0.5) * cfg.jitter, cfg.decimals);
  }

  const breach =
    cfg.direction === "above" ? value >= cfg.threshold : value <= cfg.threshold;

  const near =
    cfg.direction === "above"
      ? value >= cfg.threshold * 0.9
      : value <= cfg.threshold * 1.05;

  return {
    deviceId: dev.deviceId,
    assetId: dev.assetId,
    metric: cfg.metric,
    value,
    unit: cfg.unit,
    threshold: cfg.threshold,
    direction: cfg.direction,
    status: s.estopActive
      ? ("normal" as const)
      : breach
        ? ("critical" as const)
        : near
          ? ("warning" as const)
          : ("normal" as const),
    timestamp: new Date().toISOString(),
  };
}

function deviceStatus(readings: ReturnType<typeof readingFor>[]): DeviceStatus {
  if (store().estopActive) return "stopped";
  return readings.some((r) => r.status === "critical") ? "degraded" : "operational";
}

/* ---------- Public API ---------- */

export function latestTelemetry(
  deviceId = FAULT_DEVICE,
  metric?: Metric
) {
  ensureIncident();

  const dev = DEVICES.find((d) => d.deviceId === deviceId) ?? DEVICES[2];
  const cfg =
    dev.metrics.find((m) => m.metric === (metric ?? dev.primaryMetric)) ??
    dev.metrics[0];

  return readingFor(dev, cfg);
}

export function snapshot() {
  ensureIncident();
  const s = store();

  return {
    estopActive: s.estopActive,
    conveyorSpeed: s.estopActive ? 0 : s.conveyorSpeed,
    devices: DEVICES.map((d) => {
      const readings = d.metrics.map((m) => readingFor(d, m));
      return {
        deviceId: d.deviceId,
        label: d.label,
        assetId: d.assetId,
        role: d.role,
        status: deviceStatus(readings),
        readings,
      };
    }),
  };
}

export function ensureIncident() {
  const s = store();
  if (!inFault()) return;
  if (s.incidents.some((i) => i.status === "awaiting_approval")) return;

  const dev = DEVICES.find((d) => d.deviceId === FAULT_DEVICE)!;
  const cfg = dev.metrics[0];
  const incidentId = nextId("INC");

  s.incidents.unshift({
    incidentId,
    deviceId: dev.deviceId,
    assetId: dev.assetId,
    metric: cfg.metric,
    observedValue: cfg.fault,
    threshold: cfg.threshold,
    severity: "high",
    status: "awaiting_approval",
    summary: `Vibration exceeded threshold on ${dev.assetId}`,
    confidence: 0.91,
    modelVersion: "baseline-threshold-v1",
    recommendedAction: {
      code: "slow_conveyor",
      label: "Reduce conveyor speed to 50%",
    },
    detectedAt: new Date().toISOString(),
  });
  log("incident.created", "monitoring-agent", "system");

  s.approvals.unshift({
    approvalId: nextId("APR"),
    incidentId,
    requestedBy: "diagnosis-agent",
    requestedAt: new Date().toISOString(),
    status: "pending",
    action: { code: "slow_conveyor", label: "Reduce conveyor speed to 50%" },
  });
  log("approval.requested", "diagnosis-agent", "system");
}

export function openIncidents() {
  ensureIncident();
  return store().incidents.filter((i) => i.status === "awaiting_approval");
}

export function pendingApprovals() {
  ensureIncident();
  return store().approvals.filter((a) => a.status === "pending");
}

export function auditLog(limit = 20) {
  return store().audit.slice(0, limit);
}

export function decide(
  approvalId: string,
  decision: "approve" | "reject",
  reason: string,
  actor: string,
  actorRole: string
) {
  const s = store();
  const approval = s.approvals.find((a) => a.approvalId === approvalId);

  if (!approval) return { ok: false as const, code: 404 };
  if (approval.status !== "pending") return { ok: false as const, code: 409 };

  const incident = s.incidents.find((i) => i.incidentId === approval.incidentId);

  if (decision === "approve") {
    approval.status = "approved";
    if (incident) incident.status = "resolved";
    s.resolved = true;
    s.conveyorSpeed = 50;
    log("approval.approved", actor, actorRole, reason);
    log("command.executed", "network-agent", "system");
    log("recovery.verified", "monitoring-agent", "system");
  } else {
    approval.status = "rejected";
    if (incident) incident.status = "rejected";
    log("approval.rejected", actor, actorRole, reason);
  }

  return { ok: true as const, approval };
}

export function triggerEstop(actor: string, actorRole: string, reason: string) {
  const s = store();

  s.estopActive = true;
  s.conveyorSpeed = 0;

  s.incidents.forEach((i) => {
    if (i.status === "awaiting_approval") i.status = "resolved";
  });
  s.approvals.forEach((a) => {
    if (a.status === "pending") a.status = "rejected";
  });

  log("estop.triggered", actor, actorRole, reason);
  log("command.executed", "network-agent", "system");

  return { ok: true as const };
}

export function clearEstop(actor: string, actorRole: string, reason: string) {
  const s = store();

  if (!s.estopActive) return { ok: false as const, code: 409 };

  s.estopActive = false;
  s.conveyorSpeed = 100;

  // Re-arm the scenario: the fault can occur again FAULT_AFTER_MS from now
  s.resolved = false;
  s.startedAt = Date.now();

  log("estop.cleared", actor, actorRole, reason);
  log("command.executed", "network-agent", "system");

  return { ok: true as const };
}

export function reset() {
  g.__aegisStore = fresh();
  log("scenario.reset", "system", "system");
  return { ok: true as const };
}