import type { ReactNode } from 'react'
import { GlowBlob } from '@/components/ui/GlowBlob'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-10">
      <GlowBlob position="top-right" color="lime" />
      <GlowBlob position="bottom-left" color="violet" />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  )
}
