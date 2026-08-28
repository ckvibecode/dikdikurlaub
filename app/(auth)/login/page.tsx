import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { LoginForm } from '@/components/auth/LoginForm'
import { AuthBrand } from '@/components/auth/AuthBrand'

export default function LoginPage() {
  return (
    <Card className="flex flex-col gap-6 p-5">
      <AuthBrand />
      <div className="animate-rise-in" style={{ animationDelay: '90ms' }}>
        <h1 className="text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
          Einloggen
        </h1>
        <p className="mt-2 text-sm leading-snug text-muted-1">
          Trip-Code, Name und PIN eingeben.
        </p>
      </div>
      <div className="animate-rise-in" style={{ animationDelay: '170ms' }}>
        <LoginForm />
      </div>
      <p className="text-center text-sm text-muted-1">
        Noch nicht dabei?{' '}
        <Link href="/join" className="font-semibold text-accent-lime">
          Trip beitreten
        </Link>
      </p>
    </Card>
  )
}
