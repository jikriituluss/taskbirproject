import { z } from 'zod'
import { loginUser, getUserWorkspaces } from '../../services/auth.service'
import { assertDatabaseReady, setSessionCookie } from '../../utils/auth'
import { readValidatedJson } from '../../utils/validation'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi')
})

export default defineEventHandler(async (event) => {
  assertDatabaseReady()
  const body = await readValidatedJson(event, loginSchema)
  const user = await loginUser(body)
  setSessionCookie(event, user.id)
  const workspaces = await getUserWorkspaces(user.id)
  return { user, workspaces }
})
