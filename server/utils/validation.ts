import type { z } from 'zod'
import type { H3Event } from 'h3'

export async function readValidatedJson<T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T
): Promise<z.infer<T>> {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    throw createError({
      statusCode: 400,
      statusMessage: firstIssue?.message || 'Input tidak valid.',
      data: {
        issues: result.error.issues
      }
    })
  }
  return result.data
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return base || 'workspace'
}
