"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useActiveAlert } from "@/app/hooks/useActiveAlert";
import { SEVERITY_STYLE } from "@/lib/constants";

export default function AlertBanner() {
  const { incident } = useActiveAlert();

  if (!incident) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-red-900">
            {incident.summary}
          </span>
          <Badge
            variant="outline"
            className={SEVERITY_STYLE[incident.severity]}
          >
            {incident.severity}
          </Badge>
        </div>

        <p className="mt-1 text-sm text-red-800">
          Observed <b>{incident.observedValue}</b> vs threshold{" "}
          <b>{incident.threshold}</b> · {incident.incidentId}
        </p>

        <p className="mt-1 text-xs text-red-700">
          Recommended: {incident.recommendedAction.label} · confidence{" "}
          {(incident.confidence * 100).toFixed(0)}% · {incident.modelVersion}
        </p>
      </div>
    </div>
  );
}