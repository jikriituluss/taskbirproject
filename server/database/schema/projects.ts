import {
  mysqlTable,
  varchar,
  text,
  mysqlEnum,
  date,
  timestamp,
  uniqueIndex,
  index
} from 'drizzle-orm/mysql-core'
import { users } from './users'
import { workspaces } from './workspaces'
import { PROJECT_STATUSES } from '../../../shared/types/domain'

export const projects = mysqlTable(
  'projects',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    workspaceId: varchar('workspace_id', { length: 36 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 160 }).notNull(),
    description: text('description'),
    status: mysqlEnum('status', PROJECT_STATUSES).default('active').notNull(),
    startDate: date('start_date'),
    dueDate: date('due_date'),
    createdBy: varchar('created_by', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
  },
  (table) => [
    index('projects_workspace_idx').on(table.workspaceId),
    index('projects_workspace_status_idx').on(table.workspaceId, table.status)
  ]
)

export const projectMembers = mysqlTable(
  'project_members',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    projectId: varchar('project_id', { length: 36 })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at').defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('project_members_project_user_unique').on(
      table.projectId,
      table.userId
    ),
    index('project_members_user_idx').on(table.userId)
  ]
)

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type ProjectMember = typeof projectMembers.$inferSelect
export type NewProjectMember = typeof projectMembers.$inferInsert
