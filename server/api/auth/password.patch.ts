import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../database'
import { users } from '../../database/schema'
import { hashPassword, requireAuth, verifyPassword } from '../../utils/auth'
import { readValidatedJson } from '../../utils/validation'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter').max(128),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password baru tidak cocok',
    path: ['confirmPassword']
  })

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const body = await readValidatedJson(event, changePasswordSchema)

  const db = useDb()
  const [row] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan.' })
  }

  if (!verifyPassword(body.currentPassword, row.passwordHash)) {
    throw createError({ statusCode: 400, statusMessage: 'Password saat ini tidak sesuai.' })
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(body.newPassword) })
    .where(eq(users.id, user.id))

  return { ok: true }
})
