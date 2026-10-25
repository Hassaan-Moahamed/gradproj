export const ROLES = ["admin", "engineer", "operator", "maintenance"] as const;
export type Role = (typeof ROLES)[number];

/** مين يقدر يعمل إيه — مرجع §11.1 (منع الموافقة غير المصرّح بها) */
export const CAN = {
  "approval.decide":     ["admin", "operator"],
  "command.estop":       ["admin", "operator"],   // يوقّف
  "command.estop.clear": ["admin"],               // يشغّل ← admin بس
  "device.quarantine":   ["admin", "engineer"],
  "enrollment.decide":   ["admin"],
  "audit.view":          ["admin", "engineer", "operator", "maintenance"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof CAN;

export function can(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (CAN[permission] as readonly string[]).includes(role);
}