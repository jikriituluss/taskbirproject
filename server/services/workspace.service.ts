import { randomUUID } from 'node:crypto'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { useDb } from '../database'
import {
  notifications,
  tasks,
  users,
  workspaceMembers,
  workspaces
} from '../database/schema'
import { slugify } from '../utils/validation'
import type { WorkspaceRole } from '../../shared/types/domain'

export async function createWorkspace(
  ownerId: string,
  input: { name: string; description?: string }
) {
  const db = useDb()
  const workspaceId = randomUUID()
  const memberId = randomUUID()
  const slug = `${slugify(input.name)}-${workspaceId.slice(0, 6)}`

  await db.transaction(async (tx) => {
    await tx.insert(workspaces).values({
      id: workspaceId,
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      ownerId
    })

    await tx.insert(workspaceMembers).values({
      id: memberId,
      workspaceId,
      userId: ownerId,
      role: 'owner'
    })
  })

  return {
    id: workspaceId,
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
    ownerId,
    role: 'owner' as WorkspaceRole
  }
}

export async function updateWorkspace(
  workspaceId: string,
  input: { name: string; description?: string | null }
) {
  const db = useDb()
  await db
    .update(workspaces)
    .set({
      name: input.name.trim(),
      description: input.description?.trim() || null
    })
    .where(eq(workspaces.id, workspaceId))

  const [updated] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1)

  return updated
}

export async function listWorkspaceMembers(workspaceId: string) {
  const db = useDb()
  const members = await db
    .select({
      memberId: workspaceMembers.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId))

  const workspaceTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      assigneeId: tasks.assigneeId,
      dueDate: tasks.dueDate,
      projectId: tasks.projectId
    })
    .from(tasks)
    .where(eq(tasks.workspaceId, workspaceId))

  return members.map((m) => {
    const memberTasks = workspaceTasks.filter((t) => t.assigneeId === m.userId)
    return {
      ...m,
      taskCount: memberTasks.length,
      completedTaskCount: memberTasks.filter((t) => t.status === 'done').length,
      tasks: memberTasks
    }
  })
}

export async function inviteWorkspaceMember(
  workspaceId: string,
  inviterName: string,
  workspaceName: string,
  input: { email: string; role: WorkspaceRole }
) {
  const db = useDb()
  const normalizedEmail = input.email.trim().toLowerCase()

  const [targetUser] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Pengguna dengan email tersebut belum terdaftar di Taskora. Minta mereka mendaftar terlebih dahulu.'
    })
  }

  const [existing] = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, targetUser.id)
      )
    )
    .limit(1)

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Pengguna sudah menjadi anggota workspace ini.'
    })
  }

  if (input.role === 'owner') {
    const [existingOwner] = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.role, 'owner')
        )
      )
      .limit(1)

    if (existingOwner) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Workspace sudah memiliki Owner. Hanya 1 Owner yang diperbolehkan.'
      })
    }
  }

  const memberId = randomUUID()
  await db.insert(workspaceMembers).values({
    id: memberId,
    workspaceId,
    userId: targetUser.id,
    role: input.role
  })

  await db.insert(notifications).values({
    id: randomUUID(),
    workspaceId,
    userId: targetUser.id,
    type: 'workspace_invited',
    title: `Undangan Workspace: ${workspaceName}`,
    message: `${inviterName} menambahkan Anda ke workspace "${workspaceName}" sebagai ${input.role}.`,
    entityType: 'workspace',
    entityId: workspaceId
  })

  return {
    memberId,
    userId: targetUser.id,
    name: targetUser.name,
    email: targetUser.email,
    avatarUrl: targetUser.avatarUrl,
    role: input.role
  }
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole,
  currentUserId: string
) {
  const db = useDb()
  const [target] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.id, memberId),
        eq(workspaceMembers.workspaceId, workspaceId)
      )
    )
    .limit(1)

  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'Anggota tidak ditemukan.' })
  }

  if (target.userId === currentUserId && role !== 'owner') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anda tidak dapat menurunkan role Anda sendiri sebagai Owner.'
    })
  }

  if (role === 'owner' && target.role !== 'owner') {
    const [existingOwner] = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.role, 'owner')
        )
      )
      .limit(1)

    if (existingOwner && existingOwner.id !== memberId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Workspace sudah memiliki Owner. Hanya 1 Owner yang diperbolehkan.'
      })
    }
  }

  await db
    .update(workspaceMembers)
    .set({ role })
    .where(eq(workspaceMembers.id, memberId))

  return { memberId, role }
}

export async function removeWorkspaceMember(
  workspaceId: string,
  memberId: string,
  currentUserId: string
) {
  const db = useDb()
  const [target] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.id, memberId),
        eq(workspaceMembers.workspaceId, workspaceId)
      )
    )
    .limit(1)

  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'Anggota tidak ditemukan.' })
  }

  if (target.userId === currentUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Owner tidak dapat menghapus dirinya sendiri dari workspace.'
    })
  }

  await db.delete(workspaceMembers).where(eq(workspaceMembers.id, memberId))
  return { deleted: true }
}

export async function listUserNotifications(workspaceId: string, userId: string) {
  const db = useDb()
  return db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.userId, userId)
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(25)
}

export async function markNotificationRead(
  workspaceId: string,
  userId: string,
  notificationId: string
) {
  const db = useDb()
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.userId, userId)
      )
    )
  return { ok: true }
}

export async function ensureUsersInWorkspace(workspaceId: string, userIds: string[]) {
  if (userIds.length === 0) return []
  const db = useDb()
  return db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        inArray(workspaceMembers.userId, userIds)
      )
    )
}
