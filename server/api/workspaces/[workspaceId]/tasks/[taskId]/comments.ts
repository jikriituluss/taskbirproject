import { z } from 'zod'
import { addTaskComment, listTaskComments } from '../../../../../services/task.service'
import { requireWorkspaceAccess } from '../../../../../utils/auth'
import { readValidatedJson } from '../../../../../utils/validation'
import { isDatabaseConfigured } from '../../../../../database'
import {
  createDemoId,
  getDemoState,
  getDemoWorkspaceOrThrow
} from '../../../../../utils/demo-store'

const commentSchema = z.object({
  content: z.string().min(1, 'Komentar tidak boleh kosong').max(3000)
})

export default defineEventHandler(async (event) => {
  const workspaceId = getRouterParam(event, 'workspaceId') || ''
  const taskId = getRouterParam(event, 'taskId') || ''

  if (!isDatabaseConfigured()) {
    getDemoWorkspaceOrThrow(workspaceId)
    const demo = getDemoState()

    if (event.method === 'GET') {
      return {
        comments: demo.comments.filter((c) => c.taskId === taskId)
      }
    }

    if (event.method === 'POST') {
      const body = await readValidatedJson(event, commentSchema)
      const comment = {
        id: createDemoId('demo-comment'),
        taskId,
        userId: demo.user.id,
        authorName: demo.user.name,
        authorAvatar: demo.user.avatarUrl,
        content: body.content.trim(),
        createdAt: new Date().toISOString()
      }
      demo.comments.push(comment)
      return { comment }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const ctx = await requireWorkspaceAccess(event, workspaceId)

  if (event.method === 'GET') {
    const comments = await listTaskComments(workspaceId, taskId)
    return { comments }
  }

  if (event.method === 'POST') {
    const body = await readValidatedJson(event, commentSchema)
    const comment = await addTaskComment(
      workspaceId,
      taskId,
      ctx.user.id,
      ctx.user.name,
      body.content
    )
    return { comment }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
