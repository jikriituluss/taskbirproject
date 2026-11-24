import { createHash, randomBytes } from 'node:crypto'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../database'
import { users } from '../../database/schema'
import { assertDatabaseReady } from '../../utils/auth'
import { readValidatedJson } from '../../utils/validation'

const forgotSchema = z.object({
  email: z.string().email('Format email tidak valid')
})

export default defineEventHandler(async (event) => {
  assertDatabaseReady()
  const body = await readValidatedJson(event, forgotSchema)
  const email = body.email.trim().toLowerCase()

  const db = useDb()
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    return {
      ok: true,
      message: 'Jika email terdaftar, tautan reset password telah disiapkan.'
    }
  }

  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await db
    .update(users)
    .set({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: expiresAt
    })
    .where(eq(users.id, user.id))

  return {
    ok: true,
    message: 'Tautan reset password berhasil dibuat (berlaku 1 jam).',
    resetUrl: `/reset-password?token=${rawToken}`
  }
})
