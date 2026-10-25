import { z } from "zod";
import { SchemaAuditList } from "@/app/schema/SchemaAudit";
import { apiClient } from "./apiClient";
import { endpoints } from "./endpoints";

export const auditService = {
  getRecent: async (limit = 20) => {
    const res = await apiClient.get(endpoints.audit(limit), SchemaAuditList);
    return res.data;
  },

  resetScenario: () =>
    apiClient.post(endpoints.resetScenario(), z.object({ ok: z.boolean() })),
};