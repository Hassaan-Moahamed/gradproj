import { z } from "zod";

export const SchemaSignin = z.object({
  username: z.string().min(2, "اسم المستخدم مطلوب"),
  password: z.string().min(4, "كلمة المرور قصيرة"),
});

export type SigninInput = z.infer<typeof SchemaSignin>;