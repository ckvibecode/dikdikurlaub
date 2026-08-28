'use client'

import { useActionState, useState } from 'react'
import {
  renameMember,
  setMemberAvatar,
  setMemberRole,
  resetMemberPin,
  adjustMemberPoints,
  deleteMember,
  type ActionState,
} from '@/lib/actions/admin-actions'
import { MAX_ADMIN_POINT_ADJUSTMENT } from '@/lib/admin-limits'
import { AVATAR_COLORS } from '@/lib/validations'
import { AVATAR_HEX, AVATAR_LABELS, getAvatarHex } from '@/lib/avatar'
import { ADMIN_FIELD, ADMIN_LABEL } from '@/lib/field-styles'
import { StatNumber } from '@/components/ui/StatNumber'
import { ConfirmActionButton } from '@/components/admin/ConfirmActionButton'
import { ActionFeedback } from '@/components/admin/ActionFeedback'
import { TrashIcon } from '@/components/icons'

const initialState: ActionState = {}

export interface AdminMemberRow {
  id: string
  name: string
  avatar: string
  role: 'ADMIN' | 'MEMBER'
  points: number
  level: number
  drinkCount: number
  penaltyCount: number
  planItemCount: number
  participationCount: number
}

export function MemberAdminCard({
  member,
  isSelf,
  takenAvatars,
  isOnlyAdmin,
}: {
  member: AdminMemberRow
  isSelf: boolean
  takenAvatars: string[]
  /** Der letzte Admin darf die Rolle nicht abgeben -- sonst verwaltet niemand mehr den Trip. */
  isOnlyAdmin: boolean
}) {
  const [open, setOpen] = useState(false)
  const [renameState, renameAction, renamePending] = useActionState(renameMember, initialState)
  const [avatarState, avatarAction] = useActionState(setMemberAvatar, initialState)
  const [pinState, pinAction, pinPending] = useActionState(resetMemberPin, initialState)
  const [pointsState, pointsAction, pointsPending] = useActionState(adjustMemberPoints, initialState)

  const hex = getAvatarHex(member.avatar)

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-3.5 text-left"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-background"
          style={{ backgroundColor: hex }}
        >
          {member.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">{member.name}</span>
            {member.role === 'ADMIN' && (
              <span className="shrink-0 rounded-full border border-member/45 bg-member/14 px-2 py-0.5 text-[10px] font-semibold text-member">
                Admin
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-muted-2">
            Level {member.level} · {member.drinkCount} Getränke · {member.penaltyCount} Strafen
          </span>
        </span>
        <StatNumber size="md" className="shrink-0 text-foreground">
          {member.points}
        </StatNumber>
        <span aria-hidden className={`shrink-0 text-muted-2 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-white/[0.06] p-3.5">
          {/* Name */}
          <form action={renameAction} className="flex flex-col gap-2">
            <input type="hidden" name="memberId" value={member.id} />
            <label>
              <span className={ADMIN_LABEL}>Name</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="name"
                  defaultValue={member.name}
                  required
                  minLength={2}
                  maxLength={20}
                  className={`${ADMIN_FIELD} min-w-0 flex-1`}
                />
                <button
                  type="submit"
                  disabled={renamePending}
                  className="shrink-0 rounded-xl border border-member/45 px-3 text-xs font-semibold text-member disabled:opacity-50"
                >
                  {renamePending ? '…' : 'OK'}
                </button>
              </div>
            </label>
            <ActionFeedback state={renameState} />
          </form>

          {/* Farbe */}
          <form action={avatarAction} className="flex flex-col gap-2">
            <input type="hidden" name="memberId" value={member.id} />
            <span className={ADMIN_LABEL}>Profilfarbe</span>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((color) => {
                const isCurrent = color === member.avatar
                // Vergebene Farben bleiben sichtbar, aber gesperrt: sonst wirkt die Palette
                // je nach Mitglied willkürlich unterschiedlich lang.
                const taken = takenAvatars.includes(color) && !isCurrent
                return (
                  <button
                    key={color}
                    type="submit"
                    name="avatar"
                    value={color}
                    disabled={taken}
                    aria-label={`${AVATAR_LABELS[color]}${taken ? ' (vergeben)' : ''}`}
                    aria-pressed={isCurrent}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      isCurrent ? 'ring-2 ring-foreground ring-offset-2 ring-offset-surface' : ''
                    }`}
                    // Deckkraft inline statt per `disabled:`-Variante: der Zustand steht beim
                    // Rendern ohnehin fest, und so haengt die Anzeige an keiner Utility-Klasse.
                    style={{ backgroundColor: AVATAR_HEX[color], opacity: taken ? 0.25 : 1 }}
                  />
                )
              })}
            </div>
            <ActionFeedback state={avatarState} />
          </form>

          {/* Punkte */}
          <form action={pointsAction} className="flex flex-col gap-2">
            <input type="hidden" name="memberId" value={member.id} />
            <span className={ADMIN_LABEL}>Punkte korrigieren</span>
            <div className="flex gap-2">
              <input
                type="number"
                name="amount"
                placeholder="+10"
                required
                min={-MAX_ADMIN_POINT_ADJUSTMENT}
                max={MAX_ADMIN_POINT_ADJUSTMENT}
                className={`${ADMIN_FIELD} w-20 shrink-0`}
              />
              <input
                type="text"
                name="reason"
                placeholder="Grund"
                required
                maxLength={80}
                className={`${ADMIN_FIELD} min-w-0 flex-1`}
              />
              <button
                type="submit"
                disabled={pointsPending}
                className="shrink-0 rounded-xl border border-member/45 px-3 text-xs font-semibold text-member disabled:opacity-50"
              >
                {pointsPending ? '…' : 'OK'}
              </button>
            </div>
            <ActionFeedback state={pointsState} />
          </form>

          {/* PIN */}
          <form action={pinAction} className="flex flex-col gap-2">
            <input type="hidden" name="memberId" value={member.id} />
            <label>
              <span className={ADMIN_LABEL}>Neue PIN setzen</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="pin"
                  inputMode="numeric"
                  pattern="\d{4}"
                  placeholder="4 Ziffern"
                  required
                  maxLength={4}
                  className={`${ADMIN_FIELD} w-32 shrink-0 font-mono`}
                />
                <button
                  type="submit"
                  disabled={pinPending}
                  className="shrink-0 rounded-xl border border-member/45 px-3 text-xs font-semibold text-member disabled:opacity-50"
                >
                  {pinPending ? '…' : 'Setzen'}
                </button>
              </div>
            </label>
            <ActionFeedback state={pinState} />
          </form>

          {/* Rolle und Löschen */}
          <div className="flex flex-wrap items-start justify-between gap-2 border-t border-white/[0.06] pt-3.5">
            {member.role === 'ADMIN' ? (
              <ConfirmActionButton
                action={setMemberRole.bind(null, member.id, false)}
                label={isSelf ? 'Meine Rechte abgeben' : 'Admin-Rechte entziehen'}
                confirmLabel="Rechte abgeben?"
                tone="neutral"
                className={isOnlyAdmin ? 'pointer-events-none opacity-40' : ''}
              />
            ) : (
              <ConfirmActionButton
                action={setMemberRole.bind(null, member.id, true)}
                label="Zum Admin machen"
                confirmLabel="Admin machen?"
                tone="neutral"
              />
            )}

            {!isSelf && (
              <ConfirmActionButton
                action={deleteMember.bind(null, member.id)}
                label="Löschen"
                confirmLabel="Endgültig löschen?"
                icon={<TrashIcon className="h-3.5 w-3.5" />}
              />
            )}
          </div>

          {isOnlyAdmin && member.role === 'ADMIN' && (
            <p className="text-[11px] text-muted-2">
              Du bist gerade der einzige Admin. Mach erst jemand anderen zum Admin, bevor du die
              Rechte abgibst.
            </p>
          )}

          {!isSelf && (
            <p className="text-[11px] leading-relaxed text-muted-2">
              Beim Löschen verschwinden {member.drinkCount} Getränke-Einträge,{' '}
              {member.participationCount} Teilnahmen und alle Punkte-Buchungen von {member.name}.
              {member.planItemCount > 0 &&
                ` Die ${member.planItemCount} angelegten Programmpunkte bleiben der Gruppe erhalten und laufen künftig auf dich.`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
