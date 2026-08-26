'use client'

import { useTransition } from 'react'
import { logDrink } from '@/lib/actions/drink-actions'
import { PlusIcon } from '@/components/icons'

export interface DrinkCategoryOption {
  id: string
  label: string
  points: number
}

export function DrinkCounterGrid({ categories }: { categories: DrinkCategoryOption[] }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => logDrink(category.id))}
          className="relative flex flex-col items-center gap-1.5 rounded-[20px] border border-white/[0.06] bg-surface px-2 py-3.5 transition-colors active:bg-surface-hover disabled:opacity-50"
        >
          <span
            className="absolute -right-1.5 -top-1.5 rounded-full bg-accent-lime px-1.5 py-0.5 font-mono text-[10px] font-bold text-background"
            style={{ boxShadow: '0 0 0 3px var(--color-surface)' }}
          >
            +{category.points}
          </span>
          <span className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-accent-lime/14 text-accent-lime">
            <PlusIcon className="h-4.5 w-4.5" />
          </span>
          <span className="text-center text-[11px] font-semibold text-foreground">{category.label}</span>
        </button>
      ))}
    </div>
  )
}
