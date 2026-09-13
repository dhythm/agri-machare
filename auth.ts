import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authenticate, isUserRole } from '@/lib/server/auth/accounts'
import { validateLogin } from '@/lib/validation/auth'

const devSecret = 'dev-auth-secret'

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
      authorize(credentials) {
        const parsed = validateLogin(credentials)
        if (!parsed.ok) return null
        return authenticate(parsed.value.email, parsed.value.password) ?? null
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
