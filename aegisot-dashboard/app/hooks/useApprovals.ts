"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approvalsService,
  type DecidePayload,
} from "@/app/services/approvals.service";
import { env } from "@/lib/env";

export function usePendingApprovals() {
  const query = useQuery({
    queryKey: ["approvals", "pending"],
    queryFn: () => approvalsService.getPending(),
    refetchInterval: env.pollInterval,
  });

  return { ...query, approval: query.data?.[0] ?? null };
}

export function useDecideApproval() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      approvalId,
      payload,
    }: {
      approvalId: string;
      payload: DecidePayload;
    }) => approvalsService.decide(approvalId, payload),

    // بعد أي قرار، حدّث الثلاث حاجات المتأثرة
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["incidents"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}