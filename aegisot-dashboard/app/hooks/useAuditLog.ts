"use client";

import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/app/services/audit.service";

export function useAuditLog(limit = 20) {
  return useQuery({
    queryKey: ["audit", limit],
    queryFn: () => auditService.getRecent(limit),
    refetchInterval: 5000,
  });
}