import 'server-only'
import { getSessionMember } from '@/lib/auth'

export type SessionMember = NonNullable<Awaited<ReturnType<typeof getSessionMember>>>

/**
 * Die Admin-Rolle ist bewusst unsichtbar: Mitglieder sollen nicht erkennen koennen, wer den
 * Trip verwaltet. Deshalb gibt es hier zwei Varianten -- `getAdminMember` fuer Screens und
 * Formular-Actions, die selbst entscheiden, wie sie reagieren, und `requireAdmin` fuer
 * imperative Actions, die hart abbrechen sollen.
 *
 * Beide Wege sind noetig, weil Server Actions per POST direkt aufrufbar sind: die Pruefung
 * im Layout allein wuerde nichts absichern.
 */
export async function getAdminMember(): Promise<SessionMember | null> {
  const member = await getSessionMember()
  if (!member || member.role !== 'ADMIN') return null
  return member
}

export async function requireAdmin(): Promise<SessionMember> {
  const member = await getAdminMember()
  if (!member) throw new Error('Keine Berechtigung')
  return member
}

/** Alle Screens, die sich nach einer Admin-Aenderung neu aufbauen muessen. */
export const ADMIN_REVALIDATE_PATHS = [
  '/home',
  '/leaderboard',
  '/drinks',
  '/plan',
  '/strafen',
  '/admin',
  '/admin/members',
  '/admin/drinks',
  '/admin/penalties',
  '/admin/plan',
  '/admin/ledger',
] as const
