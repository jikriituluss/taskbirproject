import {
  mysqlTable,
  varchar,
  text,
  mediumtext,
  mysqlEnum,
  int,
  datetime,
  timestamp,
  index
} from 'drizzle-orm/mysql-core'
import { users } from './users'
import { workspaces } from './workspaces'
import { projects } from './projects'
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../shared/types/domain'

export const tasks = mysqlTable(
  'tasks',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    workspaceId: varchar('workspace_id', { length: 36 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: varchar('project_id', { length: 36 })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    status: mysqlEnum('status', TASK_STATUSES).default('todo').notNull(),
    priority: mysqlEnum('priority', TASK_PRIORITIES).default('medium').notNull(),
    position: int('position').default(0).notNull(),
    assigneeId: varchar('assignee_id', { length: 36 }).references(() => users.id, {
      onDelete: 'set null'
    }),
    createdBy: varchar('created_by', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    dueDate: datetime('due_date'),
    completedAt: datetime('completed_at'),
    proofUrl: text('proof_url'),
    proofImage: mediumtext('proof_image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
  },
  (table) => [
    index('tasks_workspace_idx').on(table.workspaceId),
    index('tasks_project_idx').on(table.projectId),
    index('tasks_kanban_order_idx').on(table.projectId, table.status, table.position),
    index('tasks_assignee_idx').on(table.assigneeId),
    index('tasks_due_date_idx').on(table.workspaceId, table.dueDate)
  ]
)

export const taskComments = mysqlTable(
  'task_comments',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    taskId: varchar('task_id', { length: 36 })
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
  },
  (table) => [index('task_comments_task_idx').on(table.taskId)]
)

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type TaskComment = typeof taskComments.$inferSelect
export type NewTaskComment = typeof taskComments.$inferInsert
