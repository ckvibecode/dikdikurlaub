'use client'

import { useActionState, useState } from 'react'
import { joinTrip, type ActionState } from '@/lib/actions/auth-actions'
import { Button } from '@/components/ui/Button'
import { AVATAR_COLORS, type AvatarColor } from '@/lib/validations'
import { AVATAR_HEX } from '@/lib/avatar'

const initialState: ActionState = {}

export function JoinForm({ takenAvatars }: { takenAvatars: string[] }) {
  const [state, formAction, pending] = useActionState(joinTrip, initialState)
  const availableColors = AVATAR_COLORS.filter((c) => !takenAvatars.includes(c))
  const [avatar, setAvatar] = useState<AvatarColor | ''>(availableColors[0] ?? '')

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tripCode" className="text-sm font-medium text-muted-1">
          Trip-Code
        </label>
        <input
          id="tripCode"
          name="tripCode"
          type="text"
          autoCapitalize="characters"
          required
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base outline-none focus:border-accent-lime/60"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-muted-1">
          Dein Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="z.B. Finn"
          required
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base outline-none focus:border-accent-lime/60"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted-1">Avatar-Farbe</span>
        {availableColors.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAvatar(color)}
                aria-label={color}
                className="h-9 w-9 shrink-0 rounded-full border-2 transition-transform"
                style={{
                  backgroundColor: AVATAR_HEX[color],
                  borderColor: avatar === color ? '#f2f3f5' : 'transparent',
                  transform: avatar === color ? 'scale(1.08)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-2">Alle Avatar-Farben sind schon vergeben.</p>
        )}
        <input type="hidden" name="avatar" value={avatar} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pin" className="text-sm font-medium text-muted-1">
          PIN (4 Ziffern, merk sie dir gut)
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          placeholder="••••"
          required
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base tracking-[0.3em] outline-none focus:border-accent-lime/60"
        />
      </div>

      {state?.error && <p className="text-sm text-[#ff6f6f]">{state.error}</p>}

      <Button type="submit" disabled={pending || !avatar} className="mt-1 w-full">
        {pending ? 'Beitreten...' : 'Trip beitreten'}
      </Button>
    </form>
  )
}
