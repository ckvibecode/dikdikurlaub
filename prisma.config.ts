import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Next.js liest .env.local selbst; dotenv kennt diese Konvention nicht und laedt
// standardmaessig nur .env, daher hier explizit beide (lokal vorhandene) Dateien laden.
config({ path: '.env.local' })
config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
