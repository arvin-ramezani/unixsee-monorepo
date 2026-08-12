import { z } from "zod";

export const staffLoginSchema = z.object({
  username: z.string().trim().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export type StaffLoginSchemaType = z.infer<typeof staffLoginSchema>;
