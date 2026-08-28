'use client'

import { useActionState } from 'react'
import { login, type ActionState } from '@/lib/actions/auth-actions'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/auth/FieldError'
import { inputClass } from '@/lib/field-styles'

const initialState: ActionState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)
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
        <label htmlFor="pin" className="text-sm font-medium text-muted-1">
          PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
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

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? 'Einloggen...' : 'Einloggen'}
      </Button>
    </form>
  )
}
