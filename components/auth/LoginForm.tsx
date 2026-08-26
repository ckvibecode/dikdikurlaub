'use client'

import { useActionState } from 'react'
import { login, type ActionState } from '@/lib/actions/auth-actions'
import { Button } from '@/components/ui/Button'

const initialState: ActionState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)

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
        <label htmlFor="pin" className="text-sm font-medium text-muted-1">
          PIN
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

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? 'Einloggen...' : 'Einloggen'}
      </Button>
    </form>
  )
}
