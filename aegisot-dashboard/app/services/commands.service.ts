import { z } from "zod";
import { apiClient } from "./apiClient";
import { endpoints } from "./endpoints";

const SchemaOk = z.object({ ok: z.boolean() });

export type EstopPayload = {
  reason: string;
  actor: string;
  actorRole: string;
};

export type ClearEstopPayload = EstopPayload;

export const commandsService = {
  triggerEstop: (payload: EstopPayload) =>
    apiClient.post(endpoints.estop(), SchemaOk, payload),

  clearEstop: (payload: ClearEstopPayload) =>
    apiClient.post(endpoints.estopClear(), SchemaOk, payload),
};