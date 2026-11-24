import { z } from 'zod'
import { PROJECT_STATUSES } from '../../../../../../shared/types/domain'
import {
  deleteProject,
  getProjectDetail,
  updateProject
} from '../../../../../services/project.service'
import { requireWorkspaceAccess } from '../../../../../utils/auth'
import { readValidatedJson } from '../../../../../utils/validation'
import { isDatabaseConfigured } from '../../../../../database'
import {
  getDemoProjectDetail,
  getDemoState,
  getDemoWorkspaceOrThrow
} from '../../../../../utils/demo-store'

const updateProjectSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const projectId = getRouterParam(event, 'projectId') || ''

  if (!isDatabaseConfigured()) {
    const ws = getDemoWorkspaceOrThrow(workspaceId)
    const demo = getDemoState()

    if (event.method === 'GET') {
      return { project: getDemoProjectDetail(workspaceId, projectId) }
    }

    if (ws.role !== 'owner') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Hanya Owner yang dapat mengubah atau menghapus proyek.'
      })
    }

    const idx = demo.projects.findIndex(
      (p) => p.id === projectId && p.workspaceId === workspaceId
    )
    if (idx === -1) {
      throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan.' })
    }

    if (event.method === 'PATCH') {
      const body = await readValidatedJson(event, updateProjectSchema)
      const target = demo.projects[idx]!
      if (body.name !== undefined) target.name = body.name.trim()
      if (body.description !== undefined) target.description = body.description?.trim() || null
      if (body.status !== undefined) target.status = body.status
      if (body.startDate !== undefined) target.startDate = body.startDate || null
      if (body.dueDate !== undefined) target.dueDate = body.dueDate || null
      target.updatedAt = new Date().toISOString()
      return { project: getDemoProjectDetail(workspaceId, projectId) }
    }

    if (event.method === 'DELETE') {
      demo.projects.splice(idx, 1)
      demo.tasks = demo.tasks.filter((t) => t.projectId !== projectId)
      return { deleted: true }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  if (event.method === 'GET') {
    await requireWorkspaceAccess(event, workspaceId)
    const project = await getProjectDetail(workspaceId, projectId)
    return { project }
  }

  if (event.method === 'PATCH') {
    await requireWorkspaceAccess(event, workspaceId, ['owner'])
    const body = await readValidatedJson(event, updateProjectSchema)
    const project = await updateProject(workspaceId, projectId, body)
    return { project }
  }

  if (event.method === 'DELETE') {
    await requireWorkspaceAccess(event, workspaceId, ['owner'])
    return deleteProject(workspaceId, projectId)
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
