import { z } from 'zod'

// Lime ist die Systemfarbe (Platz 1, aktiver Nav-Zustand, positive Punkte) und steht
// deshalb bewusst NICHT zur Wahl — sonst waere ein Lime-Mitglied nicht von diesen
// Systemzustaenden zu unterscheiden. AVATAR_HEX kennt Lime weiterhin, damit Altdaten
// nicht brechen.
//
// Jede Farbe kann im Trip nur einmal vergeben werden (@@unique([tripId, avatar])),
// die Palette begrenzt also die Gruppengroesse. Reihenfolge = Anzeigereihenfolge im
// Join-Formular: nach Farbton sortiert, damit das Raster wie ein Farbkreis wirkt.
export const AVATAR_COLORS = [
  'red',
  'crimson',
  'rose',
  'orange',
  'rust',
  'peach',
  'gold',
  'butter',
  'grass',
  'sage',
  'mint',
  'emerald',
  'teal',
  'ice',
  'cyan',
  'blue',
  'ocean',
  'sky',
  'violet',
  'lavender',
  'purple',
  'plum',
  'magenta',
  'pink',
  'blush',
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

export const joinTripSchema = z
  .object({
    tripCode: tripCodeSchema,
    name: nameSchema,
    avatar: z.enum(AVATAR_COLORS),
    pin: pinSchema,
    pinConfirm: pinSchema,
  })
  .refine((data) => data.pin === data.pinConfirm, {
    message: 'Die beiden PINs sind nicht gleich',
    path: ['pinConfirm'],
  })

export const loginSchema = z.object({
  tripCode: tripCodeSchema,
  name: nameSchema,
  pin: pinSchema,
})

export type JoinTripInput = z.infer<typeof joinTripSchema>
export type LoginInput = z.infer<typeof loginSchema>
