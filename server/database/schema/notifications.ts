import {
  mysqlTable,
  varchar,
  text,
  boolean,
  mysqlEnum,
  timestamp,
  index
} from 'drizzle-orm/mysql-core'
import { users } from './users'
import { workspaces } from './workspaces'
import { NOTIFICATION_TYPES } from '../../../shared/types/domain'

export const notifications = mysqlTable(
  'notifications',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    workspaceId: varchar('workspace_id', { length: 36 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: mysqlEnum('type', NOTIFICATION_TYPES).notNull(),
    title: varchar('title', { length: 180 }).notNull(),
    message: text('message'),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: varchar('entity_id', { length: 36 }),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    index('notifications_user_read_idx').on(table.userId, table.isRead),
    index('notifications_workspace_idx').on(table.workspaceId)
  ]
)

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
