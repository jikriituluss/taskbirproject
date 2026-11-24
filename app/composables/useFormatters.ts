import type { ProjectStatus, TaskPriority, TaskStatus, WorkspaceRole } from '../../shared/types/domain'

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; color: 'neutral' | 'primary' | 'warning' | 'success'; dot: string }
> = {
  todo: { label: 'To Do', color: 'neutral', dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'primary', dot: 'bg-indigo-500' },
  review: { label: 'Review', color: 'warning', dot: 'bg-amber-500' },
  done: { label: 'Done', color: 'success', dot: 'bg-emerald-500' }
}

export const TASK_PRIORITY_META: Record<
  TaskPriority,
  { label: string; color: 'neutral' | 'warning' | 'error' }
> = {
  low: { label: 'Low', color: 'neutral' },
  medium: { label: 'Medium', color: 'warning' },
  high: { label: 'High', color: 'error' }
}

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; color: 'neutral' | 'primary' | 'warning' | 'success' }
> = {
  planned: { label: 'Planned', color: 'neutral' },
  active: { label: 'Active', color: 'primary' },
  on_hold: { label: 'On Hold', color: 'warning' },
  completed: { label: 'Completed', color: 'success' },
  archived: { label: 'Archived', color: 'neutral' }
}

export const ROLE_META: Record<
  WorkspaceRole,
  { label: string; color: 'primary' | 'neutral' }
> = {
  owner: { label: 'Owner', color: 'primary' },
  member: { label: 'Anggota', color: 'neutral' }
}

export function formatDateId(dateInput?: string | Date | null): string {
  if (!dateInput) return '-'
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d)
}

export function formatDateTimeId(dateInput?: string | Date | null): string {
  if (!dateInput) return '-'
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export function toInputDate(dateInput?: string | Date | null): string {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function toInputDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function isOverdue(dateInput?: string | Date | null, status?: string): boolean {
  if (!dateInput || status === 'done') return false
  const d = new Date(dateInput)
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now()
}
