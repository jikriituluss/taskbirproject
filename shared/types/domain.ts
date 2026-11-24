export const WORKSPACE_ROLES = ['owner', 'member'] as const
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]

export const PROJECT_STATUSES = [
  'planned',
  'active',
  'on_hold',
  'completed',
  'archived'
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const TASK_STATUSES = [
  'todo',
  'in_progress',
  'review',
  'done'
] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const NOTIFICATION_TYPES = [
  'task_assigned',
  'task_status_changed',
  'task_commented',
  'task_due_soon',
  'workspace_invited',
  'project_added'
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]
