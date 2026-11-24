import { z } from 'zod'
import { PROJECT_STATUSES } from '../../../../../shared/types/domain'
import { createProject, listWorkspaceProjects } from '../../../../services/project.service'
import { requireWorkspaceAccess } from '../../../../utils/auth'
import { readValidatedJson } from '../../../../utils/validation'
import { isDatabaseConfigured } from '../../../../database'
import {
  createDemoId,
  getDemoProjectDetail,
  getDemoProjectsWithStats,
  getDemoState,
  getDemoWorkspaceOrThrow
} from '../../../../utils/demo-store'

const createProjectSchema = z.object({
  name: z.string().min(2, 'Nama proyek minimal 2 karakter').max(160),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  memberIds: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''

  if (!isDatabaseConfigured()) {
    const ws = getDemoWorkspaceOrThrow(workspaceId)
    const demo = getDemoState()

    if (event.method === 'GET') {
      return { projects: getDemoProjectsWithStats(workspaceId) }
    }

    if (event.method === 'POST') {
      if (ws.role !== 'owner') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Hanya Owner yang dapat membuat proyek baru.'
        })
      }
      const body = await readValidatedJson(event, createProjectSchema)
      const id = createDemoId('demo-proj')
      const now = new Date().toISOString()
      demo.projects.unshift({
        id,
        workspaceId,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        status: body.status || 'active',
        startDate: body.startDate || null,
        dueDate: body.dueDate || null,
        createdBy: demo.user.id,
        createdAt: now,
        updatedAt: now,
        memberIds: Array.from(new Set([demo.user.id, ...(body.memberIds || [])]))
      })
      return { project: getDemoProjectDetail(workspaceId, id) }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  if (event.method === 'GET') {
    await requireWorkspaceAccess(event, workspaceId)
    const projects = await listWorkspaceProjects(workspaceId)
    return { projects }
  }

  if (event.method === 'POST') {
    const ctx = await requireWorkspaceAccess(event, workspaceId, ['owner'])
    const body = await readValidatedJson(event, createProjectSchema)
    const project = await createProject(workspaceId, ctx.user.id, body)
    return { project }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
