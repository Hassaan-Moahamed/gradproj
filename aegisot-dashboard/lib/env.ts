export const env = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK === "true",
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  pollInterval: Number(process.env.NEXT_PUBLIC_POLL_INTERVAL ?? 2000),
} as const;

/**
 * جذر الـ API.
 * mock mode → Route Handlers جوّه Next
 * real mode → Laravel
 */
export const API_ROOT = env.useMock ? "/api/mock" : env.apiBaseUrl;