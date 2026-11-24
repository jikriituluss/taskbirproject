import { z } from 'zod'
import { WORKSPACE_ROLES } from '../../../../../shared/types/domain'
import { updateWorkspaceMemberRole } from '../../../../services/workspace.service'
import { requireWorkspaceAccess } from '../../../../utils/auth'
import { readValidatedJson } from '../../../../utils/validation'
import { isDatabaseConfigured } from '../../../../database'
import { getDemoState } from '../../../../utils/demo-store'

const roleSchema = z.object({
  role: z.enum(WORKSPACE_ROLES)
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const memberId = getRouterParam(event, 'memberId') || ''
  const body = await readValidatedJson(event, roleSchema)

  if (!isDatabaseConfigured()) {
    const members = getDemoState().members
    const member = members.find(
      (m) => m.memberId === memberId && m.workspaceId === workspaceId
    )
    if (!member) {
      throw createError({ statusCode: 404, statusMessage: 'Anggota tidak ditemukan.' })
    }
    if (
      body.role === 'owner' &&
      members.some(
        (m) => m.workspaceId === workspaceId && m.role === 'owner' && m.memberId !== memberId
      )
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Workspace sudah memiliki Owner. Hanya 1 Owner yang diperbolehkan.'
      })
    }
    member.role = body.role
    return { member: { memberId, role: body.role } }
  }

  const ctx = await requireWorkspaceAccess(event, workspaceId, ['owner'])
  const updated = await updateWorkspaceMemberRole(
    workspaceId,
    memberId,
    body.role,
    ctx.user.id
  )
  return { member: updated }
})
