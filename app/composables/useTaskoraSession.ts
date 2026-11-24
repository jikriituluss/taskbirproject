import type { WorkspaceRole } from '../../shared/types/domain'

export interface SessionUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface SessionWorkspace {
  id: string
  name: string
  slug: string
  description: string | null
  ownerId: string
  role: WorkspaceRole
}

export function useTaskoraSession() {
  const user = useState<SessionUser | null>('taskora:user', () => null)
  const workspaces = useState<SessionWorkspace[]>('taskora:workspaces', () => [])
  const activeWorkspaceId = useCookie<string | null>('taskora_active_workspace', {
    default: () => null,
    sameSite: 'lax'
  })
  const databaseConfigured = useState<boolean>('taskora:db-configured', () => true)
  const sessionLoaded = useState<boolean>('taskora:session-loaded', () => false)

  const activeWorkspace = computed(() => {
    if (workspaces.value.length === 0) return null
    return (
      workspaces.value.find((w) => w.id === activeWorkspaceId.value) ||
      workspaces.value[0] ||
      null
    )
  })

  const currentRole = computed<WorkspaceRole | null>(() => activeWorkspace.value?.role || null)
  const isOwner = computed(() => currentRole.value === 'owner')
  const canManageProjects = computed(() => currentRole.value === 'owner')
  const canAssignTasks = computed(() => currentRole.value === 'owner')

  async function fetchSession(force = false) {
    if (sessionLoaded.value && !force) return
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const data = await $fetch<{
        authenticated: boolean
        databaseConfigured: boolean
        user: SessionUser | null
        workspaces: SessionWorkspace[]
      }>('/api/auth/me', { headers })

      databaseConfigured.value = data.databaseConfigured
      user.value = data.user
      workspaces.value = data.workspaces || []

      if (
        workspaces.value.length > 0 &&
        (!activeWorkspaceId.value ||
          !workspaces.value.some((w) => w.id === activeWorkspaceId.value))
      ) {
        activeWorkspaceId.value = workspaces.value[0]!.id
      }
      sessionLoaded.value = true
    } catch {
      user.value = null
      workspaces.value = []
      sessionLoaded.value = true
    }
  }

  function switchWorkspace(workspaceId: string) {
    activeWorkspaceId.value = workspaceId
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    workspaces.value = []
    activeWorkspaceId.value = null
    sessionLoaded.value = false
    await navigateTo('/login')
  }

  return {
    user,
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    currentRole,
    isOwner,
    canManageProjects,
    canAssignTasks,
    databaseConfigured,
    sessionLoaded,
    fetchSession,
    switchWorkspace,
    logout
  }
}
