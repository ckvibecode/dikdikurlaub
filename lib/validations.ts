import { z } from 'zod'

export const AVATAR_COLORS = [
  'lime',
  'violet',
  'blue',
  'pink',
  'orange',
  'red',
  'teal',
  'gold',
  'purple',
  'mint',
] as const
export type AvatarColor = (typeof AVATAR_COLORS)[number]

const tripCodeSchema = z
  .string()
  .trim()
  .min(3, 'Trip-Code ist zu kurz')
  .max(20, 'Trip-Code ist zu lang')
  .transform((v) => v.toUpperCase())

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name muss mindestens 2 Zeichen haben')
  .max(20, 'Name darf maximal 20 Zeichen haben')

const pinSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, 'PIN muss genau 4 Ziffern haben')

export const joinTripSchema = z.object({
  tripCode: tripCodeSchema,
  name: nameSchema,
  avatar: z.enum(AVATAR_COLORS),
  pin: pinSchema,
})

export const loginSchema = z.object({
  tripCode: tripCodeSchema,
  name: nameSchema,
  pin: pinSchema,
})

export type JoinTripInput = z.infer<typeof joinTripSchema>
export type LoginInput = z.infer<typeof loginSchema>
