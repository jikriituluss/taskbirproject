import { getWorkspaceReports } from '../../../services/analytics.service'
import { requireWorkspaceAccess } from '../../../utils/auth'
import { isDatabaseConfigured } from '../../../database'
import { getDemoReports, getDemoWorkspaceOrThrow } from '../../../utils/demo-store'

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  if (!isDatabaseConfigured()) {
    getDemoWorkspaceOrThrow(workspaceId)
    return getDemoReports(workspaceId)
  }

  await requireWorkspaceAccess(event, workspaceId)
  return getWorkspaceReports(workspaceId)
})
