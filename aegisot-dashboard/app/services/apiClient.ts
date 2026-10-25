import type { ZodType } from "zod";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  url: string,
  schema: ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (res.status === 403) message = "غير مصرح لك بتنفيذ هذا الإجراء";
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  const json = await res.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    console.error("Schema mismatch:", url, parsed.error.issues);
    throw new ApiError("شكل البيانات الراجعة من السيرفر غير متوقع", 500);
  }

  return parsed.data;
}

export const apiClient = {
  get: <T>(url: string, schema: ZodType<T>) => request(url, schema),
  post: <T>(url: string, schema: ZodType<T>, body?: unknown) =>
    request(url, schema, { method: "POST", body: JSON.stringify(body ?? {}) }),
};