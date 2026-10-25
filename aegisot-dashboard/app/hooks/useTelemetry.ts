"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TelemetryReading } from "@/app/schema/SchemaTelemetry";
import { telemetryService } from "@/app/services/telemetry.service";
import { DEFAULT_DEVICE_ID } from "@/lib/constants";
import { env } from "@/lib/env";

const MAX_POINTS = 30;

export function useTelemetry(deviceId: string = DEFAULT_DEVICE_ID) {
  const query = useQuery({
    queryKey: ["telemetry", deviceId],
    queryFn: () => telemetryService.getLatest(deviceId),
    refetchInterval: env.pollInterval,
    refetchIntervalInBackground: true,
  });

  // بنبني تاريخ القراءات في المتصفح عشان الرسم البياني
  const [series, setSeries] = useState<TelemetryReading[]>([]);
  const lastTimestamp = useRef<string | null>(null);

  useEffect(() => {
    const reading = query.data;
    if (!reading) return;
    if (lastTimestamp.current === reading.timestamp) return;
    lastTimestamp.current = reading.timestamp;
    setSeries((prev) => [...prev, reading].slice(-MAX_POINTS));
  }, [query.data]);

  return { ...query, reading: query.data, series };
}