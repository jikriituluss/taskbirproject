import { z } from 'zod'
import { addProjectMember, removeProjectMember } from '../../../../../services/project.service'
import { requireWorkspaceAccess } from '../../../../../utils/auth'
import { readValidatedJson } from '../../../../../utils/validation'
import { isDatabaseConfigured } from '../../../../../database'
import {
  getDemoProjectDetail,
  getDemoState,
  getDemoWorkspaceOrThrow
} from '../../../../../utils/demo-store'

const memberSchema = z.object({
  userId: z.string().min(1, 'userId wajib diisi')
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const projectId = getRouterParam(event, 'projectId') || ''

  if (!isDatabaseConfigured()) {
    const ws = getDemoWorkspaceOrThrow(workspaceId)
    if (ws.role !== 'owner') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Hanya Owner yang dapat mengatur anggota proyek.'
      })
    }
    const demo = getDemoState()
    const project = demo.projects.find(
      (p) => p.id === projectId && p.workspaceId === workspaceId
    )
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan.' })
    }
    const body = await readValidatedJson(event, memberSchema)

    if (event.method === 'POST') {
      if (!project.memberIds.includes(body.userId)) {
        project.memberIds.push(body.userId)
      }
      return { project: getDemoProjectDetail(workspaceId, projectId) }
    }

    if (event.method === 'DELETE') {
      project.memberIds = project.memberIds.filter((id) => id !== body.userId)
      return { project: getDemoProjectDetail(workspaceId, projectId) }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  await requireWorkspaceAccess(event, workspaceId, ['owner'])

  if (event.method === 'POST') {
    const body = await readValidatedJson(event, memberSchema)
    const project = await addProjectMember(workspaceId, projectId, body.userId)
    return { project }
  }

  if (event.method === 'DELETE') {
    const body = await readValidatedJson(event, memberSchema)
    const project = await removeProjectMember(workspaceId, projectId, body.userId)
    return { project }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
