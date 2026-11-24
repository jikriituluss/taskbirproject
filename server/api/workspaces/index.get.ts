import { getUserWorkspaces } from '../../services/auth.service'
import { requireAuth } from '../../utils/auth'
import { isDatabaseConfigured } from '../../database'
import { getDemoState } from '../../utils/demo-store'

export default defineEventHandler(async (event) => {
  if (!isDatabaseConfigured()) {
    return { workspaces: getDemoState().workspaces }
  }
  const { user } = await requireAuth(event)
  const workspaces = await getUserWorkspaces(user.id)
  return { workspaces }
})
