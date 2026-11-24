import { getWorkspaceDashboard } from '../../../services/analytics.service'
import { requireWorkspaceAccess } from '../../../utils/auth'
import { isDatabaseConfigured } from '../../../database'
import { getDemoDashboard, getDemoWorkspaceOrThrow } from '../../../utils/demo-store'

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  if (!isDatabaseConfigured()) {
    getDemoWorkspaceOrThrow(workspaceId)
    return getDemoDashboard(workspaceId)
  }

  await requireWorkspaceAccess(event, workspaceId)
  return getWorkspaceDashboard(workspaceId)
})
