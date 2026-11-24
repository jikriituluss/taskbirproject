import { createHash } from 'node:crypto'
import { z } from 'zod'
import { and, eq, gt } from 'drizzle-orm'
import { useDb } from '../../database'
import { users } from '../../database/schema'
import { assertDatabaseReady, hashPassword } from '../../utils/auth'
import { readValidatedJson } from '../../utils/validation'

const resetSchema = z
  .object({
    token: z.string().min(10, 'Token reset tidak valid'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter').max(128),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword']
  })

export default defineEventHandler(async (event) => {
  assertDatabaseReady()
  const body = await readValidatedJson(event, resetSchema)
  const tokenHash = createHash('sha256').update(body.token.trim()).digest('hex')

  const db = useDb()
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.resetTokenHash, tokenHash),
        gt(users.resetTokenExpiresAt, new Date())
      )
    )
    .limit(1)

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tautan reset password tidak valid atau sudah kedaluwarsa.'
    })
  }

  await db
    .update(users)
    .set({
      passwordHash: hashPassword(body.newPassword),
      resetTokenHash: null,
      resetTokenExpiresAt: null
    })
    .where(eq(users.id, user.id))

  return { ok: true }
})
