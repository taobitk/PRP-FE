import { z } from 'zod'

const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
})

export const env = envSchema.parse({
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080',
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
})
