const BASE =
  'rounded-xl border bg-white/[0.04] px-4 py-3 text-base outline-none transition-colors'

export function inputClass(hasError: boolean): string {
  return hasError
    ? `${BASE} border-danger/70 focus:border-danger`
    : `${BASE} border-white/10 focus:border-member/60`
}
