"use client";

import { useQuery } from "@tanstack/react-query";
import { alertsService } from "@/app/services/alerts.service";
import { env } from "@/lib/env";

export function useActiveAlert() {
  const query = useQuery({
    queryKey: ["incidents", "open"],
    queryFn: () => alertsService.getOpenIncidents(),
    refetchInterval: env.pollInterval,
  });

  return { ...query, incident: query.data?.[0] ?? null };
}