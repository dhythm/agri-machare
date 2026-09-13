import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { isSuspended } from '@/lib/server/auth/account-status'
import { authenticate, isUserRole } from '@/lib/server/auth/accounts'
import { validateLogin } from '@/lib/validation/auth'

const devSecret = 'dev-auth-secret'

/** Surfaces as `code=suspended` on the login page without leaking details. */
class SuspendedAccount extends CredentialsSignin {
  code = 'suspended'
}

/** `AUTH_SECRET` is required in production; other environments fall back. */
function configuredSecret(): string | undefined {
  const explicit = process.env.AUTH_SECRET?.trim()
  if (explicit) return explicit
  return process.env.NODE_ENV === 'production' ? undefined : devSecret
}

export const { handlers, auth } = NextAuth({
  secret: configuredSecret(),
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = validateLogin(credentials)
        if (!parsed.ok) return null
        const user = authenticate(parsed.value.email, parsed.value.password)
        if (!user) return null
        if (await isSuspended(user.id)) throw new SuspendedAccount()
        return user
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (typeof token.id === 'string') session.user.id = token.id
      if (isUserRole(token.role)) session.user.role = token.role
      return session
    },
  },
})
