import { listWorkspaceMembers } from '../../../../services/workspace.service'
import { requireWorkspaceAccess } from '../../../../utils/auth'
import { isDatabaseConfigured } from '../../../../database'
import { getDemoState, getDemoWorkspaceOrThrow } from '../../../../utils/demo-store'

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''

  if (!isDatabaseConfigured()) {
    getDemoWorkspaceOrThrow(workspaceId)
    const demo = getDemoState()
    const wsMembers = demo.members.filter((m) => m.workspaceId === workspaceId)
    const wsTasks = demo.tasks.filter((t) => t.workspaceId === workspaceId)
    return {
      members: wsMembers.map((m) => {
        const memberTasks = wsTasks.filter((t) => t.assigneeId === m.userId)
        return {
          ...m,
          taskCount: memberTasks.length,
          completedTaskCount: memberTasks.filter((t) => t.status === 'done').length,
          tasks: memberTasks
        }
      })
    }
  }

  await requireWorkspaceAccess(event, workspaceId)
  const members = await listWorkspaceMembers(workspaceId)
  return { members }
})
