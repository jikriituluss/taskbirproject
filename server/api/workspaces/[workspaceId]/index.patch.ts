import { z } from 'zod'
import { updateWorkspace } from '../../../services/workspace.service'
import { requireWorkspaceAccess } from '../../../utils/auth'
import { readValidatedJson } from '../../../utils/validation'
import { isDatabaseConfigured } from '../../../database'
import { getDemoWorkspaceOrThrow } from '../../../utils/demo-store'

const updateSchema = z.object({
  name: z.string().min(2, 'Nama workspace minimal 2 karakter').max(120),
  description: z.string().max(1000).nullable().optional()
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const body = await readValidatedJson(event, updateSchema)

  if (!isDatabaseConfigured()) {
    const ws = getDemoWorkspaceOrThrow(workspaceId)
    if (ws.role !== 'owner') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Hanya Owner yang dapat mengubah nama workspace.'
      })
    }
    ws.name = body.name.trim()
    ws.description = body.description?.trim() || null
    return { workspace: ws }
  }

  await requireWorkspaceAccess(event, workspaceId, ['owner'])
  const workspace = await updateWorkspace(workspaceId, body)
  return { workspace }
})
