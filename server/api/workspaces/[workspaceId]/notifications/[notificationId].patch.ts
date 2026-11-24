import { markNotificationRead } from '../../../../services/workspace.service'
import { requireWorkspaceAccess } from '../../../../utils/auth'
import { isDatabaseConfigured } from '../../../../database'
import { getDemoState } from '../../../../utils/demo-store'

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const notificationId = getRouterParam(event, 'notificationId') || ''
  if (!isDatabaseConfigured()) {
    const target = getDemoState().notifications.find(
      (n) => n.id === notificationId && n.workspaceId === workspaceId
    )
    if (target) target.isRead = true
    return { ok: true }
  }

  const ctx = await requireWorkspaceAccess(event, workspaceId)
  return markNotificationRead(workspaceId, ctx.user.id, notificationId)
})
