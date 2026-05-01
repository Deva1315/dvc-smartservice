import { z } from "zod";
import { requiredString } from "./shared-validation";

export const loginFormSchema = z.object({
  email: requiredString("Email", 150)
    .email("Format email tidak valid.")
    .toLowerCase(),
  password: requiredString("Password", 255),
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;