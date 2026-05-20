import { z } from "zod";
import dotenv from "dotenv";

// Load .env file in non-production environments
dotenv.config();

/**
 * Zod schema for environment variable validation.
 * Application fails fast if required variables are missing or invalid.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL connection string"),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // JWT (Phase 2 – optional for now)
  JWT_SECRET: z.string().min(8).optional(),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

/**
 * Validated and typed environment variables.
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment configuration:",
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
