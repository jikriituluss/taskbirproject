import { z } from 'zod'
import { registerUserWithDefaultWorkspace } from '../../services/auth.service'
import { assertDatabaseReady, setSessionCookie } from '../../utils/auth'
import { readValidatedJson } from '../../utils/validation'

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(120),
  email: z.string().email('Format email tidak valid').max(255),
  password: z.string().min(6, 'Password minimal 6 karakter').max(128),
  workspaceName: z.string().min(2).max(120).optional()
})

export default defineEventHandler(async (event) => {
  assertDatabaseReady()
  const body = await readValidatedJson(event, registerSchema)
  const result = await registerUserWithDefaultWorkspace(body)
  setSessionCookie(event, result.user.id)
  return result
})
