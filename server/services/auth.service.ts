import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { useDb } from '../database'
import { users, workspaces, workspaceMembers } from '../database/schema'
import { hashPassword, verifyPassword } from '../utils/auth'
import { slugify } from '../utils/validation'

export async function registerUserWithDefaultWorkspace(input: {
  name: string
  email: string
  password: string
  workspaceName?: string
}) {
  const db = useDb()
  const normalizedEmail = input.email.trim().toLowerCase()

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
    })
  }

  const userId = randomUUID()
  const workspaceId = randomUUID()
  const memberId = randomUUID()
  const passwordHash = hashPassword(input.password)
  const wsName = input.workspaceName?.trim() || `${input.name.trim()} Workspace`
  const wsSlug = `${slugify(wsName)}-${workspaceId.slice(0, 6)}`

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash
    })

    await tx.insert(workspaces).values({
      id: workspaceId,
      name: wsName,
      slug: wsSlug,
      description: 'Workspace utama Anda di Taskora',
      ownerId: userId
    })

    await tx.insert(workspaceMembers).values({
      id: memberId,
      workspaceId,
      userId,
      role: 'owner'
    })
  })

  return {
    user: {
      id: userId,
      name: input.name.trim(),
      email: normalizedEmail,
      avatarUrl: null
    },
    defaultWorkspaceId: workspaceId
  }
}

export async function loginUser(input: { email: string; password: string }) {
  const db = useDb()
  const normalizedEmail = input.email.trim().toLowerCase()

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Email atau password salah.'
    })
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl
  }
}

export async function getUserWorkspaces(userId: string) {
  const db = useDb()
  return db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      description: workspaces.description,
      ownerId: workspaces.ownerId,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
}

export async function updateUserProfile(
  userId: string,
  input: { name: string; avatarUrl?: string | null }
) {
  const db = useDb()
  await db
    .update(users)
    .set({
      name: input.name.trim(),
      avatarUrl: input.avatarUrl || null
    })
    .where(eq(users.id, userId))

  const [updated] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return updated
}
