"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSnapshot, useEstop, useClearEstop } from "@/app/hooks/useSnapshot";
import { can } from "@/lib/permissions";
import type { Device } from "@/app/schema/SchemaDevice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeviceStatus = Device["status"];

const FILL: Record<DeviceStatus, string> = {
  operational: "#16a34a",
  degraded: "#dc2626",
  stopped: "#6b7280",
  offline: "#374151",
};

const STROKE: Record<DeviceStatus, string> = {
  operational: "#166534",
  degraded: "#991b1b",
  stopped: "#4b5563",
  offline: "#1f2937",
};

const BADGE: Record<DeviceStatus, "default" | "destructive" | "secondary" | "outline"> = {
  operational: "default",
  degraded: "destructive",
  stopped: "secondary",
  offline: "outline",
};

export default function TwinPage() {
  const { devices, estopActive, conveyorSpeed, isLoading } = useSnapshot();
  const estop = useEstop();
  const clearEstop = useClearEstop();
  const { data: session } = useSession();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreReason, setRestoreReason] = useState("");

  const role = session?.user?.role;
  const actor = session?.user?.name ?? "Unknown";
  const allowedToStop = role ? can(role, "command.estop") : false;
  const allowedToRestore = role ? can(role, "command.estop.clear") : false;

  const statusOf = (id: string): DeviceStatus =>
    devices.find((d) => d.deviceId === id)?.status ?? "offline";

  const conveyorRunning = !estopActive && conveyorSpeed > 0;

  function handleEstop() {
    estop.mutate(
      {
        reason: "Manual emergency stop triggered from Digital Twin",
        actor,
        actorRole: role ?? "operator",
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          toast.success("Emergency stop executed — line halted");
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "E-Stop failed"),
      }
    );
  }

  function handleRestore() {
    if (restoreReason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters");
      return;
    }

    clearEstop.mutate(
      {
        reason: restoreReason.trim(),
        actor,
        actorRole: role ?? "admin",
      },
      {
        onSuccess: () => {
          setRestoreOpen(false);
          setRestoreReason("");
          toast.success("Line restored — conveyor back to 100%");
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Restore failed"),
      }
    );
  }

  if (isLoading && devices.length === 0) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Digital Twin — Line 1</h1>
          <p className="text-sm text-muted-foreground">
            Conveyor {conveyorSpeed}% ·{" "}
            {estopActive ? (
              <span className="font-semibold text-destructive">E-STOP ACTIVE</span>
            ) : (
              "E-Stop clear"
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {estopActive && allowedToRestore ? (
            <Button
              variant="outline"
              size="lg"
              disabled={clearEstop.isPending}
              onClick={() => setRestoreOpen(true)}
              className="h-14 border-green-600 text-green-700 hover:bg-green-50"
            >
              ⟳ Restore line
            </Button>
          ) : null}

          {estopActive && !allowedToRestore ? (
            <div className="rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
              Only <span className="font-medium">admin</span> can restore the line
            </div>
          ) : null}

          {allowedToStop ? (
            <Button
              variant="destructive"
              size="lg"
              disabled={estopActive || estop.isPending}
              onClick={() => setConfirmOpen(true)}
              className="h-14 min-w-56 rounded-full text-base font-bold tracking-wider shadow-lg ring-4 ring-destructive/20"
            >
              {estopActive ? "■ LINE HALTED" : "⏻ EMERGENCY STOP"}
            </Button>
          ) : (
            <div className="rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
              E-Stop requires <span className="font-medium">admin</span> or{" "}
              <span className="font-medium">operator</span> role
            </div>
          )}
        </div>
      </div>

      {/* Plant layout */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Plant layout</CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 900 260" className="w-full" role="img" aria-label="Line 1 digital twin">
            <rect x="0" y="0" width="900" height="260" rx="12" fill="#0b1220" />

            {/* ZTP Gateway */}
            <rect x="40" y="150" width="120" height="70" rx="10" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
            <text x="100" y="180" textAnchor="middle" fill="#e5e7eb" fontSize="13" fontWeight="600">ZTP</text>
            <text x="100" y="199" textAnchor="middle" fill="#93c5fd" fontSize="11">Gateway</text>
            <line x1="160" y1="185" x2="220" y2="185" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 4" />

            {/* Conveyor belt */}
            <rect
              x="220"
              y="175"
              width="620"
              height="20"
              rx="10"
              fill={estopActive ? "#7f1d1d" : conveyorRunning ? "#065f46" : "#374151"}
              stroke={estopActive ? "#ef4444" : "none"}
              strokeWidth="2"
            />
            {conveyorRunning ? (
              <line x1="220" y1="185" x2="840" y2="185" stroke="#34d399" strokeWidth="4" strokeDasharray="14 14">
                <animate
                  attributeName="stroke-dashoffset"
                  from="28"
                  to="0"
                  dur={`${Math.max(0.35, 90 / Math.max(conveyorSpeed, 1))}s`}
                  repeatCount="indefinite"
                />
              </line>
            ) : null}
            <text x="530" y="220" textAnchor="middle" fill="#9ca3af" fontSize="12">
              Conveyor — {estopActive ? "HALTED (E-STOP)" : `${conveyorSpeed}%`}
            </text>

            <Station x={280} label="Station A" sub="Camera / Detection" deviceId="esp32-node-a" status={statusOf("esp32-node-a")} />
            <Station x={500} label="Conveyor" sub="Drive / E-Stop" deviceId="esp32-node-b" status={estopActive ? "stopped" : statusOf("esp32-node-b")} />
            <Station x={720} label="Station B" sub="ADXL345 / INA219" deviceId="esp32-node-c" status={statusOf("esp32-node-c")} />
          </svg>
        </CardContent>
      </Card>

      {/* Device cards with live readings */}
      <div className="grid gap-4 md:grid-cols-3">
        {devices.map((d) => (
          <Card key={d.deviceId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{d.label}</CardTitle>
              <Badge variant={BADGE[d.status]}>{d.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {d.deviceId} · {d.assetId}
              </p>
              <div className="space-y-1.5">
                {d.readings.map((r) => (
                  <div key={r.metric} className="flex items-baseline justify-between text-sm">
                    <span className="text-muted-foreground">{r.metric}</span>
                    <span
                      className={
                        r.status === "critical"
                          ? "font-bold text-destructive"
                          : r.status === "warning"
                            ? "font-semibold text-amber-600"
                            : "font-medium"
                      }
                    >
                      {r.value} <span className="text-xs text-muted-foreground">{r.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* E-Stop confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm emergency stop</DialogTitle>
            <DialogDescription>
              This halts the conveyor immediately and sets all actuators to a safe state.
              Restarting the line requires a separate authorized action. This action is
              recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={estop.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleEstop} disabled={estop.isPending}>
              {estop.isPending ? "Stopping..." : "Yes, stop the line"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore dialog */}
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore line after emergency stop</DialogTitle>
            <DialogDescription>
              Confirm the hazard is cleared, the line is free of personnel, and the
              physical E-Stop has been released before restarting. This action is
              recorded in the audit log under your name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="restore-reason">Reason</Label>
            <Input
              id="restore-reason"
              value={restoreReason}
              onChange={(e) => setRestoreReason(e.target.value)}
              placeholder="Area inspected and cleared, bearing replaced on station B"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreOpen(false)}
              disabled={clearEstop.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={clearEstop.isPending}>
              {clearEstop.isPending ? "Restoring..." : "Confirm and restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Station({
  x,
  label,
  sub,
  deviceId,
  status,
}: {
  x: number;
  label: string;
  sub: string;
  deviceId: string;
  status: DeviceStatus;
}) {
  return (
    <g>
      <line x1={x} y1="125" x2={x} y2="175" stroke="#4b5563" strokeWidth="2" />
      <rect x={x - 80} y="45" width="160" height="80" rx="10" fill={FILL[status]} stroke={STROKE[status]} strokeWidth="3" />
      {status === "degraded" ? (
        <rect x={x - 80} y="45" width="160" height="80" rx="10" fill="#dc2626">
          <animate attributeName="opacity" values="0.15;0.7;0.15" dur="1.1s" repeatCount="indefinite" />
        </rect>
      ) : null}
      <text x={x} y="75" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">{label}</text>
      <text x={x} y="94" textAnchor="middle" fill="#e5e7eb" fontSize="10">{sub}</text>
      <text x={x} y="113" textAnchor="middle" fill="#d1d5db" fontSize="9">{deviceId}</text>
    </g>
  );
}