import { randomUUID } from 'node:crypto'
import { and, asc, desc, eq } from 'drizzle-orm'
import { useDb } from '../database'
import {
  notifications,
  projectMembers,
  projects,
  taskComments,
  tasks,
  users,
  workspaceMembers
} from '../database/schema'
import type { TaskPriority, TaskStatus, WorkspaceRole } from '../../shared/types/domain'

function parseDateTime(val?: string | null): Date | null {
  if (!val) return null
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? null : d
}

async function ensureAssigneeInProject(projectId: string, assigneeId: string) {
  const db = useDb()
  const [projMember] = await db
    .select({ id: projectMembers.id })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, assigneeId)
      )
    )
    .limit(1)

  if (!projMember) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Penanggung jawab harus merupakan anggota dari proyek tersebut.'
    })
  }
}

export async function listWorkspaceTasks(
  workspaceId: string,
  filters?: {
    projectId?: string
    assigneeId?: string
    status?: TaskStatus
    priority?: TaskPriority
  }
) {
  const db = useDb()
  const conditions = [eq(tasks.workspaceId, workspaceId)]
  if (filters?.projectId) conditions.push(eq(tasks.projectId, filters.projectId))
  if (filters?.assigneeId) conditions.push(eq(tasks.assigneeId, filters.assigneeId))
  if (filters?.status) conditions.push(eq(tasks.status, filters.status))
  if (filters?.priority) conditions.push(eq(tasks.priority, filters.priority))

  const rows = await db
    .select({
      id: tasks.id,
      workspaceId: tasks.workspaceId,
      projectId: tasks.projectId,
      projectName: projects.name,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      position: tasks.position,
      assigneeId: tasks.assigneeId,
      assigneeName: users.name,
      assigneeAvatar: users.avatarUrl,
      createdBy: tasks.createdBy,
      dueDate: tasks.dueDate,
      completedAt: tasks.completedAt,
      proofUrl: tasks.proofUrl,
      proofImage: tasks.proofImage,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(and(...conditions))
    .orderBy(asc(tasks.position), desc(tasks.createdAt))

  return rows
}

export async function createTask(
  workspaceId: string,
  creatorId: string,
  creatorName: string,
  input: {
    projectId: string
    title: string
    description?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string | null
    dueDate?: string | null
    proofUrl?: string | null
    proofImage?: string | null
  }
) {
  const db = useDb()

  const [project] = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(and(eq(projects.id, input.projectId), eq(projects.workspaceId, workspaceId)))
    .limit(1)

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan di workspace ini.' })
  }

  if (input.assigneeId) {
    const [wsMember] = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, input.assigneeId)
        )
      )
      .limit(1)

    if (!wsMember) {
      throw createError({ statusCode: 400, statusMessage: 'Assignee bukan anggota workspace ini.' })
    }
    await ensureAssigneeInProject(input.projectId, input.assigneeId)
  }

  const status = input.status || 'todo'
  const existingInCol = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(
      and(
        eq(tasks.workspaceId, workspaceId),
        eq(tasks.projectId, input.projectId),
        eq(tasks.status, status)
      )
    )

  const taskId = randomUUID()
  await db.insert(tasks).values({
    id: taskId,
    workspaceId,
    projectId: input.projectId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    status,
    priority: input.priority || 'medium',
    position: existingInCol.length,
    assigneeId: input.assigneeId || null,
    createdBy: creatorId,
    dueDate: parseDateTime(input.dueDate),
    completedAt: status === 'done' ? new Date() : null,
    proofUrl: input.proofUrl?.trim() || null,
    proofImage: input.proofImage || null
  })

  if (input.assigneeId && input.assigneeId !== creatorId) {
    await db.insert(notifications).values({
      id: randomUUID(),
      workspaceId,
      userId: input.assigneeId,
      type: 'task_assigned',
      title: `Tugas Baru: ${input.title.trim()}`,
      message: `${creatorName} menugaskan "${input.title.trim()}" pada proyek ${project.name}.`,
      entityType: 'task',
      entityId: taskId
    })
  }

  const [created] = await listWorkspaceTasks(workspaceId, { projectId: input.projectId })
  return (await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1))[0] || created
}

export async function updateTask(
  workspaceId: string,
  taskId: string,
  userId: string,
  role: WorkspaceRole,
  input: {
    title?: string
    description?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string | null
    dueDate?: string | null
    position?: number
    proofUrl?: string | null
    proofImage?: string | null
  }
) {
  const db = useDb()
  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Tugas tidak ditemukan.' })
  }

  if (role === 'member' && existing.assigneeId !== userId && existing.createdBy !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Member hanya dapat mengubah tugas yang menjadi tanggung jawabnya.'
    })
  }

  if (
    role !== 'owner' &&
    input.assigneeId !== undefined &&
    (input.assigneeId || null) !== (existing.assigneeId || null)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Hanya Owner yang dapat membagikan atau mengubah penanggung jawab tugas.'
    })
  }

  if (
    role !== 'owner' &&
    (input.title !== undefined ||
      input.description !== undefined ||
      input.priority !== undefined ||
      input.dueDate !== undefined)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Hanya Owner yang dapat mengubah detail tugas. Anggota hanya dapat memperbarui status dan bukti kerja.'
    })
  }

  if (input.assigneeId) {
    await ensureAssigneeInProject(existing.projectId, input.assigneeId)
  }

  const nextStatus = input.status ?? existing.status
  let completedAt = existing.completedAt
  if (input.status !== undefined) {
    completedAt = nextStatus === 'done' ? existing.completedAt || new Date() : null
  }

  await db
    .update(tasks)
    .set({
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.status !== undefined ? { status: input.status, completedAt } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId || null } : {}),
      ...(input.dueDate !== undefined ? { dueDate: parseDateTime(input.dueDate) } : {}),
      ...(input.position !== undefined ? { position: input.position } : {}),
      ...(input.proofUrl !== undefined ? { proofUrl: input.proofUrl?.trim() || null } : {}),
      ...(input.proofImage !== undefined ? { proofImage: input.proofImage || null } : {})
    })
    .where(eq(tasks.id, taskId))

  const [updated] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)
  return updated
}

export async function deleteTask(
  workspaceId: string,
  taskId: string,
  userId: string,
  role: WorkspaceRole
) {
  const db = useDb()
  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Tugas tidak ditemukan.' })
  }

  if (role !== 'owner') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Hanya Owner yang dapat menghapus tugas.'
    })
  }

  await db.delete(tasks).where(eq(tasks.id, taskId))
  return { deleted: true }
}

export async function reorderKanbanTasks(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
  updates: Array<{ id: string; status: TaskStatus; position: number }>
) {
  const db = useDb()

  await db.transaction(async (tx) => {
    for (const item of updates) {
      const [existing] = await tx
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, item.id), eq(tasks.workspaceId, workspaceId)))
        .limit(1)

      if (!existing) continue
      if (role === 'member' && existing.assigneeId !== userId && existing.createdBy !== userId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Anda hanya dapat memindahkan tugas yang menjadi tanggung jawab Anda.'
        })
      }

      await tx
        .update(tasks)
        .set({
          status: item.status,
          position: item.position,
          completedAt: item.status === 'done' ? existing.completedAt || new Date() : null
        })
        .where(eq(tasks.id, item.id))
    }
  })

  return { ok: true }
}

export async function listTaskComments(workspaceId: string, taskId: string) {
  const db = useDb()
  const [task] = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
    .limit(1)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Tugas tidak ditemukan.' })
  }

  return db
    .select({
      id: taskComments.id,
      taskId: taskComments.taskId,
      userId: taskComments.userId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      content: taskComments.content,
      createdAt: taskComments.createdAt
    })
    .from(taskComments)
    .innerJoin(users, eq(taskComments.userId, users.id))
    .where(eq(taskComments.taskId, taskId))
    .orderBy(asc(taskComments.createdAt))
}

export async function addTaskComment(
  workspaceId: string,
  taskId: string,
  userId: string,
  authorName: string,
  content: string
) {
  const db = useDb()
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
    .limit(1)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Tugas tidak ditemukan.' })
  }

  const commentId = randomUUID()
  await db.insert(taskComments).values({
    id: commentId,
    taskId,
    userId,
    content: content.trim()
  })

  if (task.assigneeId && task.assigneeId !== userId) {
    await db.insert(notifications).values({
      id: randomUUID(),
      workspaceId,
      userId: task.assigneeId,
      type: 'task_commented',
      title: `Komentar baru di "${task.title}"`,
      message: `${authorName}: ${content.trim().slice(0, 120)}`,
      entityType: 'task',
      entityId: taskId
    })
  }

  return {
    id: commentId,
    taskId,
    userId,
    authorName,
    content: content.trim(),
    createdAt: new Date()
  }
}
