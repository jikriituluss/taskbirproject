import { removeWorkspaceMember } from '../../../../services/workspace.service'
import { requireWorkspaceAccess } from '../../../../utils/auth'
import { isDatabaseConfigured } from '../../../../database'
import { getDemoState } from '../../../../utils/demo-store'

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const memberId = getRouterParam(event, 'memberId') || ''

  if (!isDatabaseConfigured()) {
    const demo = getDemoState()
    const idx = demo.members.findIndex(
      (m) => m.memberId === memberId && m.workspaceId === workspaceId
    )
    if (idx === -1) {
      throw createError({ statusCode: 404, statusMessage: 'Anggota tidak ditemukan.' })
    }
    demo.members.splice(idx, 1)
    return { deleted: true }
  }

  const ctx = await requireWorkspaceAccess(event, workspaceId, ['owner'])
  return removeWorkspaceMember(workspaceId, memberId, ctx.user.id)
})
