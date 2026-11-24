import { z } from 'zod'
import { TASK_STATUSES } from '../../../../../shared/types/domain'
import { reorderKanbanTasks } from '../../../../services/task.service'
import { requireWorkspaceAccess } from '../../../../utils/auth'
import { readValidatedJson } from '../../../../utils/validation'
import { isDatabaseConfigured } from '../../../../database'
import { getDemoState, getDemoWorkspaceOrThrow } from '../../../../utils/demo-store'

const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        status: z.enum(TASK_STATUSES),
        position: z.number().int().min(0)
      })
    )
    .min(1)
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const body = await readValidatedJson(event, reorderSchema)

  if (!isDatabaseConfigured()) {
    getDemoWorkspaceOrThrow(workspaceId)
    const demo = getDemoState()
    const now = new Date().toISOString()
    for (const item of body.items) {
      const target = demo.tasks.find((t) => t.id === item.id && t.workspaceId === workspaceId)
      if (target) {
        target.status = item.status
        target.position = item.position
        target.completedAt = item.status === 'done' ? target.completedAt || now : null
        target.updatedAt = now
      }
    }
    return { ok: true }
  }

  const ctx = await requireWorkspaceAccess(event, workspaceId)
  return reorderKanbanTasks(workspaceId, ctx.user.id, ctx.role, body.items)
})
