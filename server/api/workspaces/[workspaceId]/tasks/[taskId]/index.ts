import { z } from 'zod'
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../../../../shared/types/domain'
import { deleteTask, updateTask } from '../../../../../services/task.service'
import { requireWorkspaceAccess } from '../../../../../utils/auth'
import { readValidatedJson } from '../../../../../utils/validation'
import { isDatabaseConfigured } from '../../../../../database'
import { getDemoState, getDemoWorkspaceOrThrow } from '../../../../../utils/demo-store'

const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  position: z.number().int().min(0).optional(),
  proofUrl: z.string().url('Format link bukti tidak valid (harus diawali http:// atau https://)').max(2000).nullable().optional().or(z.literal('')),
  proofImage: z.string().max(3_000_000, 'Ukuran foto bukti terlalu besar (maks 2MB)').nullable().optional()
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const taskId = getRouterParam(event, 'taskId') || ''

  if (!isDatabaseConfigured()) {
    const ws = getDemoWorkspaceOrThrow(workspaceId)
    const demo = getDemoState()
    const idx = demo.tasks.findIndex((t) => t.id === taskId && t.workspaceId === workspaceId)
    if (idx === -1) {
      throw createError({ statusCode: 404, statusMessage: 'Tugas tidak ditemukan.' })
    }

    if (event.method === 'PATCH') {
      const body = await readValidatedJson(event, updateTaskSchema)
      const target = demo.tasks[idx]!
      if (
        ws.role !== 'owner' &&
        body.assigneeId !== undefined &&
        (body.assigneeId || null) !== (target.assigneeId || null)
      ) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Hanya Owner yang dapat membagikan atau mengubah penanggung jawab tugas.'
        })
      }
      if (
        ws.role !== 'owner' &&
        (body.title !== undefined ||
          body.description !== undefined ||
          body.priority !== undefined ||
          body.dueDate !== undefined)
      ) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Hanya Owner yang dapat mengubah detail tugas. Anggota hanya dapat memperbarui status dan bukti kerja.'
        })
      }
      if (body.assigneeId) {
        const proj = demo.projects.find(
          (p) => p.id === target.projectId && p.workspaceId === workspaceId
        )
        if (proj && !proj.memberIds.includes(body.assigneeId)) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Penanggung jawab harus merupakan anggota dari proyek tersebut.'
          })
        }
      }
      if (body.title !== undefined) target.title = body.title.trim()
      if (body.description !== undefined) target.description = body.description?.trim() || null
      if (body.status !== undefined) {
        target.status = body.status
        target.completedAt = body.status === 'done' ? target.completedAt || new Date().toISOString() : null
      }
      if (body.priority !== undefined) target.priority = body.priority
      if (body.assigneeId !== undefined) target.assigneeId = body.assigneeId || null
      if (body.dueDate !== undefined) {
        target.dueDate = body.dueDate ? new Date(body.dueDate).toISOString() : null
      }
      if (body.position !== undefined) target.position = body.position
      if (body.proofUrl !== undefined) target.proofUrl = body.proofUrl?.trim() || null
      if (body.proofImage !== undefined) target.proofImage = body.proofImage || null
      target.updatedAt = new Date().toISOString()
      return { task: target }
    }

    if (event.method === 'DELETE') {
      if (ws.role !== 'owner') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Hanya Owner yang dapat menghapus tugas.'
        })
      }
      demo.tasks.splice(idx, 1)
      return { deleted: true }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const ctx = await requireWorkspaceAccess(event, workspaceId)

  if (event.method === 'PATCH') {
    const body = await readValidatedJson(event, updateTaskSchema)
    const task = await updateTask(workspaceId, taskId, ctx.user.id, ctx.role, body)
    return { task }
  }

  if (event.method === 'DELETE') {
    return deleteTask(workspaceId, taskId, ctx.user.id, ctx.role)
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
