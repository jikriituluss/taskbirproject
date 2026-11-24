import { randomUUID } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import { useDb } from '../database'
import {
  notifications,
  projectMembers,
  projects,
  tasks,
  users,
  workspaceMembers
} from '../database/schema'
import type { ProjectStatus } from '../../shared/types/domain'

function formatDateOnly(val?: string | null): Date | null {
  if (!val) return null
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function listWorkspaceProjects(workspaceId: string) {
  const db = useDb()
  const projectRows = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(desc(projects.createdAt))

  const allTasks = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      status: tasks.status
    })
    .from(tasks)
    .where(eq(tasks.workspaceId, workspaceId))

  const allMembers = await db
    .select({
      projectId: projectMembers.projectId,
      userId: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(eq(projects.workspaceId, workspaceId))

  return projectRows.map((p) => {
    const pTasks = allTasks.filter((t) => t.projectId === p.id)
    const doneCount = pTasks.filter((t) => t.status === 'done').length
    const progress = pTasks.length > 0 ? Math.round((doneCount / pTasks.length) * 100) : 0
    const members = allMembers.filter((m) => m.projectId === p.id)

    return {
      ...p,
      totalTasks: pTasks.length,
      completedTasks: doneCount,
      progress,
      members
    }
  })
}

export async function getProjectDetail(workspaceId: string, projectId: string) {
  const db = useDb()
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
    .limit(1)

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan.' })
  }

  const members = await db
    .select({
      id: projectMembers.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      addedAt: projectMembers.addedAt
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, projectId))

  const projectTasks = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      position: tasks.position,
      assigneeId: tasks.assigneeId,
      assigneeName: users.name,
      createdBy: tasks.createdBy,
      dueDate: tasks.dueDate,
      proofUrl: tasks.proofUrl,
      proofImage: tasks.proofImage,
      completedAt: tasks.completedAt,
      createdAt: tasks.createdAt
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(and(eq(tasks.projectId, projectId), eq(tasks.workspaceId, workspaceId)))
    .orderBy(tasks.position, desc(tasks.createdAt))

  const doneCount = projectTasks.filter((t) => t.status === 'done').length
  const progress =
    projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0

  return {
    ...project,
    totalTasks: projectTasks.length,
    completedTasks: doneCount,
    progress,
    members,
    tasks: projectTasks
  }
}

export async function createProject(
  workspaceId: string,
  userId: string,
  input: {
    name: string
    description?: string | null
    status?: ProjectStatus
    startDate?: string | null
    dueDate?: string | null
    memberIds?: string[]
  }
) {
  const db = useDb()
  const projectId = randomUUID()

  await db.transaction(async (tx) => {
    await tx.insert(projects).values({
      id: projectId,
      workspaceId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      status: input.status || 'active',
      startDate: formatDateOnly(input.startDate),
      dueDate: formatDateOnly(input.dueDate),
      createdBy: userId
    })

    const initialMemberIds = Array.from(new Set([userId, ...(input.memberIds || [])]))
    if (initialMemberIds.length > 0) {
      await tx.insert(projectMembers).values(
        initialMemberIds.map((uid) => ({
          id: randomUUID(),
          projectId,
          userId: uid
        }))
      )
    }
  })

  return getProjectDetail(workspaceId, projectId)
}

export async function updateProject(
  workspaceId: string,
  projectId: string,
  input: {
    name?: string
    description?: string | null
    status?: ProjectStatus
    startDate?: string | null
    dueDate?: string | null
  }
) {
  const db = useDb()
  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan.' })
  }

  await db
    .update(projects)
    .set({
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.startDate !== undefined
        ? { startDate: formatDateOnly(input.startDate) }
        : {}),
      ...(input.dueDate !== undefined ? { dueDate: formatDateOnly(input.dueDate) } : {})
    })
    .where(eq(projects.id, projectId))

  return getProjectDetail(workspaceId, projectId)
}

export async function deleteProject(workspaceId: string, projectId: string) {
  const db = useDb()
  const [existing] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan.' })
  }

  await db.delete(projects).where(eq(projects.id, projectId))
  return { deleted: true }
}

export async function addProjectMember(
  workspaceId: string,
  projectId: string,
  userIdToAdd: string
) {
  const db = useDb()
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
    .limit(1)

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan.' })
  }

  const [wsMember] = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userIdToAdd)
      )
    )
    .limit(1)

  if (!wsMember) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pengguna harus menjadi anggota workspace terlebih dahulu.'
    })
  }

  const [already] = await db
    .select({ id: projectMembers.id })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userIdToAdd)
      )
    )
    .limit(1)

  if (!already) {
    await db.insert(projectMembers).values({
      id: randomUUID(),
      projectId,
      userId: userIdToAdd
    })

    await db.insert(notifications).values({
      id: randomUUID(),
      workspaceId,
      userId: userIdToAdd,
      type: 'project_added',
      title: `Ditambahkan ke Proyek: ${project.name}`,
      message: `Anda telah ditambahkan sebagai anggota pada proyek "${project.name}".`,
      entityType: 'project',
      entityId: projectId
    })
  }

  return getProjectDetail(workspaceId, projectId)
}

export async function removeProjectMember(
  workspaceId: string,
  projectId: string,
  userIdToRemove: string
) {
  const db = useDb()
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
    .limit(1)

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan.' })
  }

  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userIdToRemove)
      )
    )

  return getProjectDetail(workspaceId, projectId)
}
