import { SchemaIncidentList } from "@/app/schema/SchemaIncident";
import { apiClient } from "./apiClient";
import { endpoints } from "./endpoints";

export const alertsService = {
  getOpenIncidents: async () => {
    const res = await apiClient.get(
      endpoints.openIncidents(),
      SchemaIncidentList
    );
    return res.data;
  },
};