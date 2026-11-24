import { getUserWorkspaces } from '../../services/auth.service'
import { getOptionalAuthUser } from '../../utils/auth'
import { isDatabaseConfigured } from '../../database'
import { getDemoState } from '../../utils/demo-store'

export default defineEventHandler(async (event) => {
  const dbConfigured = isDatabaseConfigured()
  if (!dbConfigured) {
    const demo = getDemoState()
    return {
      authenticated: true,
      databaseConfigured: false,
      user: demo.user,
      workspaces: demo.workspaces
    }
  }

  const ctx = await getOptionalAuthUser(event)
  if (!ctx) {
    return {
      authenticated: false,
      databaseConfigured: true,
      user: null,
      workspaces: []
    }
  }

  const workspaces = await getUserWorkspaces(ctx.user.id)
  return {
    authenticated: true,
    databaseConfigured: true,
    user: ctx.user,
    workspaces
  }
})
