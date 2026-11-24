import { z } from 'zod'
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../../../shared/types/domain'
import { createTask, listWorkspaceTasks } from '../../../../services/task.service'
import { requireWorkspaceAccess } from '../../../../utils/auth'
import { readValidatedJson } from '../../../../utils/validation'
import { isDatabaseConfigured } from '../../../../database'
import {
  createDemoId,
  getDemoState,
  getDemoTasks,
  getDemoWorkspaceOrThrow
} from '../../../../utils/demo-store'

const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Proyek wajib dipilih'),
  title: z.string().min(2, 'Judul tugas minimal 2 karakter').max(200),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  proofUrl: z.string().url('Format link bukti tidak valid (harus diawali http:// atau https://)').max(2000).nullable().optional().or(z.literal('')),
  proofImage: z.string().max(3_000_000, 'Ukuran foto bukti terlalu besar (maks 2MB)').nullable().optional()
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''

  if (!isDatabaseConfigured()) {
    const ws = getDemoWorkspaceOrThrow(workspaceId)
    const demo = getDemoState()

    if (event.method === 'GET') {
      const q = getQuery(event)
      const tasks = getDemoTasks(workspaceId, {
        projectId: typeof q.projectId === 'string' ? q.projectId : undefined,
        assigneeId: typeof q.assigneeId === 'string' ? q.assigneeId : undefined,
        status:
          typeof q.status === 'string' ? (q.status as (typeof TASK_STATUSES)[number]) : undefined,
        priority:
          typeof q.priority === 'string'
            ? (q.priority as (typeof TASK_PRIORITIES)[number])
            : undefined
      })
      return { tasks }
    }

    if (event.method === 'POST') {
      const body = await readValidatedJson(event, createTaskSchema)
      if (ws.role !== 'owner' && body.assigneeId && body.assigneeId !== demo.user.id) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Hanya Owner yang dapat membagikan tugas kepada anggota lain.'
        })
      }
      if (body.assigneeId) {
        const proj = demo.projects.find(
          (p) => p.id === body.projectId && p.workspaceId === workspaceId
        )
        if (!proj) {
          throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan.' })
        }
        if (!proj.memberIds.includes(body.assigneeId)) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Penanggung jawab harus merupakan anggota dari proyek tersebut.'
          })
        }
      }
      const id = createDemoId('demo-task')
      const now = new Date().toISOString()
      const status = body.status || 'todo'
      const colCount = demo.tasks.filter(
        (t) => t.workspaceId === workspaceId && t.status === status
      ).length
      const created = {
        id,
        workspaceId,
        projectId: body.projectId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        status,
        priority: body.priority || 'medium',
        position: colCount,
        assigneeId: body.assigneeId || null,
        createdBy: demo.user.id,
        dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
        completedAt: status === 'done' ? now : null,
        proofUrl: body.proofUrl?.trim() || null,
        proofImage: body.proofImage || null,
        createdAt: now,
        updatedAt: now
      }
      demo.tasks.push(created)
      return { task: created }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  if (event.method === 'GET') {
    await requireWorkspaceAccess(event, workspaceId)
    const q = getQuery(event)
    const tasks = await listWorkspaceTasks(workspaceId, {
      projectId: typeof q.projectId === 'string' ? q.projectId : undefined,
      assigneeId: typeof q.assigneeId === 'string' ? q.assigneeId : undefined,
      status: typeof q.status === 'string' ? (q.status as (typeof TASK_STATUSES)[number]) : undefined,
      priority:
        typeof q.priority === 'string' ? (q.priority as (typeof TASK_PRIORITIES)[number]) : undefined
    })
    return { tasks }
  }

  if (event.method === 'POST') {
    const ctx = await requireWorkspaceAccess(event, workspaceId)
    const body = await readValidatedJson(event, createTaskSchema)
    if (ctx.role !== 'owner' && body.assigneeId && body.assigneeId !== ctx.user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Hanya Owner yang dapat membagikan tugas kepada anggota lain.'
      })
    }
    const task = await createTask(workspaceId, ctx.user.id, ctx.user.name, body)
    return { task }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
