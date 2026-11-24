import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto'
import type { H3Event } from 'h3'
import { eq, and } from 'drizzle-orm'
import { useDb, isDatabaseConfigured } from '../database'
import { users, workspaceMembers, workspaces } from '../database/schema'
import type { WorkspaceRole } from '../../shared/types/domain'

const SESSION_COOKIE_NAME = 'taskora_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 hari

export interface SessionPayload {
  userId: string
  exp: number
}

export interface AuthContext {
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
}

export interface WorkspaceAuthContext extends AuthContext {
  workspace: {
    id: string
    name: string
    slug: string
    description: string | null
    ownerId: string
  }
  role: WorkspaceRole
}

function getSessionSecret(): string {
  const config = useRuntimeConfig()
  return config.sessionSecret || 'taskora-dev-fallback-secret-change-in-production'
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derived}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':')
  if (parts.length !== 2) return false
  const [salt, keyHex] = parts
  if (!salt || !keyHex) return false

  const expected = Buffer.from(keyHex, 'hex')
  const actual = scryptSync(password, salt, 64)
  if (expected.length !== actual.length) return false
  return timingSafeEqual(expected, actual)
}

function signPayload(payloadB64: string): string {
  return createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url')
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  }
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url')
  const signature = signPayload(payloadB64)
  return `${payloadB64}.${signature}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payloadB64, signature] = parts
  if (!payloadB64 || !signature) return null

  const expectedSig = signPayload(payloadB64)
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expectedSig)
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as SessionPayload
    if (!parsed.userId || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function setSessionCookie(event: H3Event, userId: string): void {
  const token = createSessionToken(userId)
  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === 'production'
  })
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: '/'
  })
}

export function assertDatabaseReady(): void {
  if (!isDatabaseConfigured()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Database TiDB belum dikonfigurasi. Silakan salin .env.example menjadi .env, isi kredensial TiDB, dan jalankan npm run db:migrate.'
    })
  }
}

export async function getOptionalAuthUser(event: H3Event): Promise<AuthContext | null> {
  if (!isDatabaseConfigured()) return null
  const token = getCookie(event, SESSION_COOKIE_NAME)
  if (!token) return null

  const payload = verifySessionToken(token)
  if (!payload) return null

  const db = useDb()
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1)

  // Pengguna tidak ada atau sesi kedaluwarsa dianggap belum masuk.
  if (!user) return null
  return { user }
}

export async function requireAuth(event: H3Event): Promise<AuthContext> {
  assertDatabaseReady()
  const ctx = await getOptionalAuthUser(event)
  if (!ctx) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.'
    })
  }
  return ctx
}

export async function requireWorkspaceAccess(
  event: H3Event,
  workspaceId: string,
  allowedRoles?: WorkspaceRole[]
): Promise<WorkspaceAuthContext> {
  const { user } = await requireAuth(event)
  if (!workspaceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'workspaceId wajib disertakan.'
    })
  }

  const db = useDb()
  const [row] = await db
    .select({
      workspaceId: workspaces.id,
      workspaceName: workspaces.name,
      workspaceSlug: workspaces.slug,
      workspaceDescription: workspaces.description,
      workspaceOwnerId: workspaces.ownerId,
      role: workspaceMembers.role
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, user.id)
      )
    )
    .limit(1)

  if (!row) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Anda tidak memiliki akses ke workspace ini.'
    })
  }

  if (allowedRoles && !allowedRoles.includes(row.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Peran Anda tidak memiliki izin untuk melakukan tindakan ini.'
    })
  }

  return {
    user,
    workspace: {
      id: row.workspaceId,
      name: row.workspaceName,
      slug: row.workspaceSlug,
      description: row.workspaceDescription,
      ownerId: row.workspaceOwnerId
    },
    role: row.role
  }
}
