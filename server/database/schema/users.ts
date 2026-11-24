import { mysqlTable, varchar, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core'

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    resetTokenHash: varchar('reset_token_hash', { length: 128 }),
    resetTokenExpiresAt: timestamp('reset_token_expires_at'),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)]
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
