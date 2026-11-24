import { z } from 'zod'
import { WORKSPACE_ROLES } from '../../../../../shared/types/domain'
import { inviteWorkspaceMember } from '../../../../services/workspace.service'
import { requireWorkspaceAccess } from '../../../../utils/auth'
import { readValidatedJson } from '../../../../utils/validation'
import { isDatabaseConfigured } from '../../../../database'
import {
  createDemoId,
  getDemoState,
  getDemoWorkspaceOrThrow
} from '../../../../utils/demo-store'

const inviteSchema = z.object({
  email: z.string().email('Email tidak valid'),
  role: z.enum(WORKSPACE_ROLES).default('member')
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const body = await readValidatedJson(event, inviteSchema)

  if (!isDatabaseConfigured()) {
    getDemoWorkspaceOrThrow(workspaceId)
    const demo = getDemoState()
    if (
      body.role === 'owner' &&
      demo.members.some((m) => m.workspaceId === workspaceId && m.role === 'owner')
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Workspace sudah memiliki Owner. Hanya 1 Owner yang diperbolehkan.'
      })
    }
    const email = body.email.trim().toLowerCase()
    const namePart = email.split('@')[0] || 'Anggota'
    const displayName = namePart
      .split(/[._-]/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ')

    const member = {
      memberId: createDemoId('demo-mem'),
      workspaceId,
      userId: createDemoId('demo-user'),
      name: displayName || 'Anggota Baru',
      email,
      avatarUrl: null,
      role: body.role,
      joinedAt: new Date().toISOString()
    }
    demo.members.push(member)
    return { member }
  }

  const ctx = await requireWorkspaceAccess(event, workspaceId, ['owner'])
  const member = await inviteWorkspaceMember(
    workspaceId,
    ctx.user.name,
    ctx.workspace.name,
    body
  )
  return { member }
})
