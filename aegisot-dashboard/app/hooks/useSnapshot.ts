"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  commandsService,
  type EstopPayload,
  type ClearEstopPayload,
} from "@/app/services/commands.service"; 
import { telemetryService } from "@/app/services/telemetry.service";
import { env } from "@/lib/env";

export function useSnapshot() {
  const query = useQuery({
    queryKey: ["snapshot"],
    queryFn: () => telemetryService.getSnapshot(),
    refetchInterval: env.pollInterval,
    refetchIntervalInBackground: true,
  });

  return {
    ...query,
    devices: query.data?.devices ?? [],
    estopActive: query.data?.estopActive ?? false,
    conveyorSpeed: query.data?.conveyorSpeed ?? 0,
  };
}

export function useEstop() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: EstopPayload) => commandsService.triggerEstop(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snapshot"] });
      qc.invalidateQueries({ queryKey: ["telemetry"] });
      qc.invalidateQueries({ queryKey: ["incidents"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
export function useClearEstop() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClearEstopPayload) =>
      commandsService.clearEstop(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snapshot"] });
      qc.invalidateQueries({ queryKey: ["telemetry"] });
      qc.invalidateQueries({ queryKey: ["incidents"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}