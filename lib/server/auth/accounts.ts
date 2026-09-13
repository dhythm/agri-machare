import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'

const userRoles = ['admin', 'user'] as const

export type UserRole = (typeof userRoles)[number]

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === 'string' &&
    (userRoles as readonly string[]).includes(value)
  )
}

export type AuthenticatedUser = {
  id: string
  email: string
  name: string
  role: UserRole
}

type Account = AuthenticatedUser & { password: string }

type AccountSource = {
  id: string
  name: string
  role: UserRole
  emailEnv: string
  passwordEnv: string
  devEmail: string
  devPassword: string
}

/**
 * Demo accounts come from the environment so the app runs without a user
 * table. Outside production an unset account falls back to a fixed
 * development login; in production an unset account is disabled.
 */
const accountSources: AccountSource[] = [
  {
    id: 'demo-admin',
    name: '運営デモ',
    role: 'admin',
    emailEnv: 'DEMO_ADMIN_EMAIL',
    passwordEnv: 'DEMO_ADMIN_PASSWORD',
    devEmail: 'admin@example.com',
    devPassword: 'dev-admin',
  },
  {
    id: 'demo-seller',
    name: '出品者デモ',
    role: 'user',
    emailEnv: 'DEMO_SELLER_EMAIL',
    passwordEnv: 'DEMO_SELLER_PASSWORD',
    devEmail: 'seller@example.com',
    devPassword: 'dev-seller',
  },
  {
    id: 'demo-user',
    name: '利用者デモ',
    role: 'user',
    emailEnv: 'DEMO_USER_EMAIL',
    passwordEnv: 'DEMO_USER_PASSWORD',
    devEmail: 'user@example.com',
    devPassword: 'dev-user',
  },
]

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function readAccount(source: AccountSource): Account | undefined {
  const email = process.env[source.emailEnv]?.trim()
  const password = process.env[source.passwordEnv]?.trim()
  if (email && password) {
    return {
      id: source.id,
      name: source.name,
      role: source.role,
      email: normalizeEmail(email),
      password,
    }
  }
  if (process.env.NODE_ENV === 'production') return undefined
  return {
    id: source.id,
    name: source.name,
    role: source.role,
    email: source.devEmail,
    password: source.devPassword,
  }
}

export function configuredAccounts(): Account[] {
  return accountSources
    .map(readAccount)
    .filter((account): account is Account => account !== undefined)
}

function matchesSecret(provided: string, expected: string): boolean {
  const left = createHash('sha256').update(provided).digest()
  const right = createHash('sha256').update(expected).digest()
  return timingSafeEqual(left, right)
}

export function authenticate(
  email: string,
  password: string,
): AuthenticatedUser | undefined {
  const target = normalizeEmail(email)
  if (!target || !password) return undefined
  const account = configuredAccounts().find(
    (candidate) => candidate.email === target,
  )
  if (!account || !matchesSecret(password, account.password)) return undefined
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
  }
}
