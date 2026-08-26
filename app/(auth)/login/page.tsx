import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <Card className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Einloggen</h1>
        <p className="mt-1 text-sm text-muted-1">Trip-Code, Name und PIN eingeben.</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-2">
        Noch nicht dabei?{' '}
        <Link href="/join" className="font-semibold text-accent-lime">
          Trip beitreten
        </Link>
      </p>
    </Card>
  )
}
