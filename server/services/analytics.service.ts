import { desc, eq } from 'drizzle-orm'
import { useDb } from '../database'
import { projects, tasks, users } from '../database/schema'

export async function getWorkspaceDashboard(workspaceId: string) {
  const db = useDb()
  const now = new Date()

  const workspaceProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(desc(projects.updatedAt))

  const workspaceTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      completedAt: tasks.completedAt,
      updatedAt: tasks.updatedAt,
      createdAt: tasks.createdAt,
      projectId: tasks.projectId,
      projectName: projects.name,
      assigneeId: tasks.assigneeId,
      assigneeName: users.name
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(eq(tasks.workspaceId, workspaceId))
    .orderBy(desc(tasks.updatedAt))

  const totalProjects = workspaceProjects.length
  const activeProjects = workspaceProjects.filter((p) => p.status === 'active').length
  const totalTasks = workspaceTasks.length
  const completedTasks = workspaceTasks.filter((t) => t.status === 'done').length

  const statusBreakdown = {
    todo: workspaceTasks.filter((t) => t.status === 'todo').length,
    in_progress: workspaceTasks.filter((t) => t.status === 'in_progress').length,
    review: workspaceTasks.filter((t) => t.status === 'review').length,
    done: completedTasks
  }

  const upcomingDeadlines = workspaceTasks
    .filter((t) => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 6)

  const overdueCount = workspaceTasks.filter(
    (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < now.getTime()
  ).length

  const oneDayAgoMs = now.getTime() - 24 * 60 * 60 * 1000
  const recentActivities = workspaceTasks
    .filter((t) => new Date(t.updatedAt).getTime() >= oneDayAgoMs)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)
    .map((t) => ({
      id: t.id,
      title: t.title,
      projectName: t.projectName,
      status: t.status,
      assigneeName: t.assigneeName,
      updatedAt: t.updatedAt
    }))

  return {
    summary: {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueCount,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    },
    statusBreakdown,
    upcomingDeadlines,
    recentActivities
  }
}

export async function getWorkspaceReports(workspaceId: string) {
  const db = useDb()
  const now = new Date()

  const workspaceProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(desc(projects.createdAt))

  const workspaceTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.workspaceId, workspaceId))

  const totalProjects = workspaceProjects.length
  const completedTasks = workspaceTasks.filter((t) => t.status === 'done').length
  const incompleteTasks = workspaceTasks.length - completedTasks
  const overdueTasks = workspaceTasks.filter(
    (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < now.getTime()
  )

  const projectProgress = workspaceProjects.map((p) => {
    const pTasks = workspaceTasks.filter((t) => t.projectId === p.id)
    const pDone = pTasks.filter((t) => t.status === 'done').length
    const pOverdue = pTasks.filter(
      (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < now.getTime()
    ).length
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      totalTasks: pTasks.length,
      completedTasks: pDone,
      incompleteTasks: pTasks.length - pDone,
      overdueTasks: pOverdue,
      progressPercentage: pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0,
      dueDate: p.dueDate
    }
  })

  return {
    metrics: {
      totalProjects,
      totalTasks: workspaceTasks.length,
      completedTasks,
      incompleteTasks,
      overdueTasksCount: overdueTasks.length
    },
    projectProgress
  }
}
