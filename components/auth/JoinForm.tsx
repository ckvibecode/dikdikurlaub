'use client'

import { useActionState, useState } from 'react'
import { joinTrip, type ActionState } from '@/lib/actions/auth-actions'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/auth/FieldError'
import { AVATAR_COLORS, type AvatarColor } from '@/lib/validations'
import { AVATAR_HEX, AVATAR_LABELS } from '@/lib/avatar'
import { inputClass } from '@/lib/field-styles'

const initialState: ActionState = {}

export function JoinForm({ takenAvatars }: { takenAvatars: string[] }) {
  const [state, formAction, pending] = useActionState(joinTrip, initialState)
  const availableColors = AVATAR_COLORS.filter((c) => !takenAvatars.includes(c))
  const [avatar, setAvatar] = useState<AvatarColor | ''>(availableColors[0] ?? '')
  const errors = state?.fieldErrors ?? {}
  const values = state?.values ?? {}

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tripCode" className="text-sm font-medium text-muted-1">
          Trip-Code
        </label>
        <input
          id="tripCode"
          name="tripCode"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          defaultValue={values.tripCode ?? ''}
          required
          aria-invalid={Boolean(errors.tripCode)}
          aria-describedby={errors.tripCode ? 'tripCode-error' : undefined}
          className={inputClass(Boolean(errors.tripCode))}
        />
        <FieldError id="tripCode-error" message={errors.tripCode} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-muted-1">
          Dein Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          defaultValue={values.name ?? ''}
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={inputClass(Boolean(errors.name))}
        />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span id="avatar-label" className="text-sm font-medium text-muted-1">
          Avatar-Farbe
        </span>
        {availableColors.length > 0 ? (
          <div
            role="group"
            aria-labelledby="avatar-label"
            aria-describedby={errors.avatar ? 'avatar-error' : undefined}
            className="grid grid-cols-5 gap-2"
          >
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAvatar(color)}
                aria-label={AVATAR_LABELS[color] ?? color}
                aria-pressed={avatar === color}
                className="flex h-11 w-11 items-center justify-center justify-self-center rounded-full"
              >
                {/* Trefferflaeche bleibt 44px; nur der sichtbare Punkt waechst beim Auswaehlen. */}
                <span
                  className="rounded-full border-2 transition-all duration-200"
                  style={{
                    backgroundColor: AVATAR_HEX[color],
                    borderColor: avatar === color ? '#f2f3f5' : 'transparent',
                    width: avatar === color ? 40 : 32,
                    height: avatar === color ? 40 : 32,
                  }}
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-1">Alle Avatar-Farben sind schon vergeben.</p>
        )}
        <FieldError id="avatar-error" message={errors.avatar} />
        <input type="hidden" name="avatar" value={avatar} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pin" className="text-sm font-medium text-muted-1">
          PIN (4 Ziffern)
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          pattern="\d{4}"
          maxLength={4}
          placeholder="••••"
          required
          aria-invalid={Boolean(errors.pin)}
          aria-describedby={errors.pin ? 'pin-error' : undefined}
          className={`${inputClass(Boolean(errors.pin))} tracking-[0.3em]`}
        />
        <FieldError id="pin-error" message={errors.pin} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pinConfirm" className="text-sm font-medium text-muted-1">
          PIN wiederholen
        </label>
        <input
          id="pinConfirm"
          name="pinConfirm"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          pattern="\d{4}"
          maxLength={4}
          placeholder="••••"
          required
          aria-invalid={Boolean(errors.pinConfirm)}
          aria-describedby={errors.pinConfirm ? 'pinConfirm-error' : 'pin-warning'}
          className={`${inputClass(Boolean(errors.pinConfirm))} tracking-[0.3em]`}
        />
        <FieldError id="pinConfirm-error" message={errors.pinConfirm} />
        <p id="pin-warning" className="mt-0.5 text-sm leading-snug text-muted-1">
          <span className="font-semibold text-foreground">Es gibt kein Zurücksetzen.</span> Ohne
          deine PIN kommst du für den Rest des Trips nicht mehr rein.
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending || !avatar} className="mt-1 w-full">
        {pending ? 'Beitreten...' : 'Trip beitreten'}
      </Button>
    </form>
  )
}
