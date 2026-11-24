import {
  mysqlTable,
  varchar,
  text,
  mysqlEnum,
  timestamp,
  uniqueIndex,
  index
} from 'drizzle-orm/mysql-core'
import { users } from './users'
import { WORKSPACE_ROLES } from '../../../shared/types/domain'

export const workspaces = mysqlTable(
  'workspaces',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    description: text('description'),
    ownerId: varchar('owner_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
  },
  (table) => [
    uniqueIndex('workspaces_slug_unique').on(table.slug),
    index('workspaces_owner_idx').on(table.ownerId)
  ]
)

export const workspaceMembers = mysqlTable(
  'workspace_members',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    workspaceId: varchar('workspace_id', { length: 36 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: mysqlEnum('role', WORKSPACE_ROLES).default('member').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('workspace_members_workspace_user_unique').on(
      table.workspaceId,
      table.userId
    ),
    index('workspace_members_user_idx').on(table.userId)
  ]
)

export type Workspace = typeof workspaces.$inferSelect
export type NewWorkspace = typeof workspaces.$inferInsert
export type WorkspaceMember = typeof workspaceMembers.$inferSelect
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert
