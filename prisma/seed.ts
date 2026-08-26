import { config } from 'dotenv'
config({ path: '.env.local' })
config()

import { PrismaClient } from '../generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import { DEFAULT_PENALTY_TYPES } from '../lib/default-penalties'
import { DEFAULT_DRINK_CATEGORIES } from '../lib/default-drink-categories'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const code = process.env.TRIP_CODE ?? 'DIKDIK2026'
  const name = process.env.TRIP_NAME ?? 'DikDik2026'
  const startDate = new Date(process.env.TRIP_START_DATE ?? '2026-07-01')
  const endDate = new Date(process.env.TRIP_END_DATE ?? '2026-07-08')

  const trip = await prisma.trip.upsert({
    where: { code },
    update: { name, startDate, endDate },
    create: { code, name, startDate, endDate },
  })

  console.log(`Trip ready: ${trip.name} (code: ${trip.code})`)

  const existingCount = await prisma.penaltyType.count({ where: { tripId: trip.id } })
  if (existingCount === 0) {
    await prisma.penaltyType.createMany({
      data: DEFAULT_PENALTY_TYPES.map((p) => ({ ...p, tripId: trip.id })),
    })
    console.log(`Seeded ${DEFAULT_PENALTY_TYPES.length} penalty types.`)
  } else {
    console.log(`Penalty catalog already has ${existingCount} entries, skipping seed.`)
  }

  const existingDrinkCategoryCount = await prisma.drinkCategory.count({ where: { tripId: trip.id } })
  if (existingDrinkCategoryCount === 0) {
    await prisma.drinkCategory.createMany({
      data: DEFAULT_DRINK_CATEGORIES.map((c) => ({ ...c, tripId: trip.id, isDefault: true })),
    })
    console.log(`Seeded ${DEFAULT_DRINK_CATEGORIES.length} drink categories.`)
  } else {
    console.log(`Drink categories already has ${existingDrinkCategoryCount} entries, skipping seed.`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
