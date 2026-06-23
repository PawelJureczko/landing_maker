import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'mysql',
  dbCredentials: { url: process.env.NUXT_DATABASE_URL! },
})
