import { relations } from 'drizzle-orm'
import { users } from './users'
import { workspaces, workspaceMembers } from './workspaces'
import { projects, projectMembers } from './projects'
import { tasks, taskComments } from './tasks'
import { notifications } from './notifications'

export const usersRelations = relations(users, ({ many }) => ({
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  projectMemberships: many(projectMembers),
  createdProjects: many(projects),
  assignedTasks: many(tasks, { relationName: 'taskAssignee' }),
  createdTasks: many(tasks, { relationName: 'taskCreator' }),
  taskComments: many(taskComments),
  notifications: many(notifications)
}))

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id]
  }),
  members: many(workspaceMembers),
  projects: many(projects),
  tasks: many(tasks),
  notifications: many(notifications)
}))

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id]
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id]
  })
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id]
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id]
  }),
  members: many(projectMembers),
  tasks: many(tasks)
}))

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id]
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id]
  })
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [tasks.workspaceId],
    references: [workspaces.id]
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id]
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: 'taskAssignee'
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: 'taskCreator'
  }),
  comments: many(taskComments)
}))

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id]
  }),
  author: one(users, {
    fields: [taskComments.userId],
    references: [users.id]
  })
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [notifications.workspaceId],
    references: [workspaces.id]
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}))
