import { z } from 'zod'
import { updateUserProfile } from '../../services/auth.service'
import { requireAuth } from '../../utils/auth'
import { readValidatedJson } from '../../utils/validation'
import { isDatabaseConfigured } from '../../database'
import { getDemoState } from '../../utils/demo-store'

const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(120),
  avatarUrl: z.string().url('URL avatar tidak valid').max(500).nullable().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedJson(event, profileSchema)
  if (!isDatabaseConfigured()) {
    const demo = getDemoState()
    demo.user.name = body.name.trim()
    if (body.avatarUrl !== undefined) demo.user.avatarUrl = body.avatarUrl
    return { user: demo.user }
  }

  const { user } = await requireAuth(event)
  const updated = await updateUserProfile(user.id, body)
  return { user: updated }
})
