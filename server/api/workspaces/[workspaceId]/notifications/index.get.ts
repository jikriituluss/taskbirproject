import { listUserNotifications } from '../../../../services/workspace.service'
import { requireWorkspaceAccess } from '../../../../utils/auth'
import { isDatabaseConfigured } from '../../../../database'
import { getDemoState, getDemoWorkspaceOrThrow } from '../../../../utils/demo-store'

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  if (!isDatabaseConfigured()) {
    getDemoWorkspaceOrThrow(workspaceId)
    const demo = getDemoState()
    return {
      notifications: demo.notifications.filter(
        (n) => n.workspaceId === workspaceId && n.userId === demo.user.id
      )
    }
  }

  const ctx = await requireWorkspaceAccess(event, workspaceId)
  const items = await listUserNotifications(workspaceId, ctx.user.id)
  return { notifications: items }
})
