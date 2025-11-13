import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Murray Myco"),
  NEXT_PUBLIC_MYCELIUM_OPACITY: z
    .preprocess((v) => {
      if (typeof v === "string") return Number(v);
      if (typeof v === "number") return v;
      return undefined;
    }, z.number().min(0).max(1))
    .default(0.12),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_MYCELIUM_OPACITY: process.env.NEXT_PUBLIC_MYCELIUM_OPACITY,
});
