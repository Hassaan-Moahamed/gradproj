import { z } from "zod";
import {
  SchemaApproval,
  SchemaApprovalList,
} from "@/app/schema/SchemaApproval";
import { apiClient } from "./apiClient";
import { endpoints } from "./endpoints";

const SchemaDecisionResponse = z.object({ data: SchemaApproval });

export type DecidePayload = {
  decision: "approve" | "reject";
  reason: string;
  actor: string;
  actorRole: string;
};

export const approvalsService = {
  getPending: async () => {
    const res = await apiClient.get(
      endpoints.pendingApprovals(),
      SchemaApprovalList
    );
    return res.data;
  },

  decide: (approvalId: string, payload: DecidePayload) =>
    apiClient.post(
      endpoints.decideApproval(approvalId),
      SchemaDecisionResponse,
      payload
    ),
};