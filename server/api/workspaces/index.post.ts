import { z } from 'zod'
import { createWorkspace } from '../../services/workspace.service'
import { requireAuth } from '../../utils/auth'
import { readValidatedJson, slugify } from '../../utils/validation'
import { isDatabaseConfigured } from '../../database'
import { createDemoId, getDemoState } from '../../utils/demo-store'

const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Nama workspace minimal 2 karakter').max(120),
  description: z.string().max(1000).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedJson(event, createWorkspaceSchema)
  if (!isDatabaseConfigured()) {
    const demo = getDemoState()
    const id = createDemoId('demo-ws')
    const ws = {
      id,
      name: body.name.trim(),
      slug: `${slugify(body.name)}-${id.slice(-4)}`,
      description: body.description?.trim() || null,
      ownerId: demo.user.id,
      role: 'owner' as const
    }
    demo.workspaces.push(ws)
    demo.members.push({
      memberId: createDemoId('demo-mem'),
      workspaceId: id,
      userId: demo.user.id,
      name: demo.user.name,
      email: demo.user.email,
      avatarUrl: demo.user.avatarUrl,
      role: 'owner',
      joinedAt: new Date().toISOString()
    })
    return { workspace: ws }
  }

  const { user } = await requireAuth(event)
  const workspace = await createWorkspace(user.id, body)
  return { workspace }
})
