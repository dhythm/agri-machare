import type { DefaultSession } from 'next-auth'
import type { UserRole } from '@/lib/server/auth/accounts'

declare module 'next-auth' {
  interface User {
    role: UserRole
  }

  interface Session {
    user: { id: string; role: UserRole } & DefaultSession['user']
  }
}
