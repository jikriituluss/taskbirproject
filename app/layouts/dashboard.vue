<script setup lang="ts">
import { ROLE_META } from '~/composables/useFormatters'

const route = useRoute()
const toast = useToast()
const {
  user,
  workspaces,
  activeWorkspace,
  currentRole,
  isOwner,
  databaseConfigured,
  fetchSession,
  switchWorkspace,
  logout
} = useTaskoraSession()

const mobileSidebarOpen = ref(false)
const createWsModalOpen = ref(false)
const renameWsModalOpen = ref(false)
const renameWsName = ref('')
const renamingWs = ref(false)
const isViewportLocked = computed(() => route.path === '/calendar')

function openRenameWorkspace() {
  if (!activeWorkspace.value || !isOwner.value) return
  renameWsName.value = activeWorkspace.value.name
  renameWsModalOpen.value = true
}

async function handleRenameWorkspace() {
  if (!activeWorkspace.value || !renameWsName.value.trim()) return
  renamingWs.value = true
  try {
    await $fetch(`/api/workspaces/${activeWorkspace.value.id}`, {
      method: 'PATCH',
      body: {
        name: renameWsName.value.trim(),
        description: activeWorkspace.value.description || null
      }
    })
    await fetchSession(true)
    renameWsModalOpen.value = false
    toast.add({ title: 'Nama workspace berhasil diubah', color: 'success' })
  } catch (err: any) {
    toast.add({
      title: 'Gagal mengubah nama workspace',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    renamingWs.value = false
  }
}

const navGroups = [
  {
    label: 'Ruang Kerja',
    items: [
      { label: 'Dashboard', to: '/', icon: 'i-lucide-layout-dashboard' },
      { label: 'My Tasks', to: '/my-tasks', icon: 'i-lucide-check-circle-2' }
    ]
  },
  {
    label: 'Perencanaan',
    items: [
      { label: 'Projects', to: '/projects', icon: 'i-lucide-folder-kanban' },
      { label: 'Kanban Board', to: '/kanban', icon: 'i-lucide-columns-3' },
      { label: 'Calendar', to: '/calendar', icon: 'i-lucide-calendar' }
    ]
  },
  {
    label: 'Tim & Analisis',
    items: [
      { label: 'Team', to: '/team', icon: 'i-lucide-users' },
      { label: 'Reports', to: '/reports', icon: 'i-lucide-bar-chart-3' }
    ]
  }
]

const bottomNavItems = [{ label: 'Settings', to: '/settings', icon: 'i-lucide-settings' }]

const notifications = ref<
  Array<{
    id: string
    title: string
    message: string | null
    isRead: boolean
    createdAt: string
  }>
>([])

const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length)

async function loadNotifications() {
  if (!activeWorkspace.value) return
  try {
    const res = await $fetch<{ notifications: typeof notifications.value }>(
      `/api/workspaces/${activeWorkspace.value.id}/notifications`
    )
    notifications.value = res.notifications || []
  } catch {
    notifications.value = []
  }
}

async function markAsRead(id: string) {
  if (!activeWorkspace.value) return
  try {
    await $fetch(`/api/workspaces/${activeWorkspace.value.id}/notifications/${id}`, {
      method: 'PATCH'
    })
    const target = notifications.value.find((n) => n.id === id)
    if (target) target.isRead = true
  } catch {
    // ignore
  }
}

function isActiveRoute(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

watch(
  () => activeWorkspace.value?.id,
  () => {
    loadNotifications()
  },
  { immediate: true }
)

watch(
  () => route.path,
  () => {
    mobileSidebarOpen.value = false
  }
)
</script>

<template>
  <div
    class="flex min-h-screen bg-slate-50 text-slate-900"
    :class="isViewportLocked ? 'lg:h-dvh lg:min-h-0 lg:overflow-hidden' : ''"
  >
    <!-- Desktop Sidebar -->
    <aside class="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex">
      <div class="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <TaskoraLogo size="sm" />
        <span class="text-lg font-bold tracking-tight text-slate-900">Taskbir</span>
      </div>

      <nav class="flex-1 space-y-5 overflow-y-auto p-3">
        <div v-for="group in navGroups" :key="group.label">
          <p class="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {{ group.label }}
          </p>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              :class="
                isActiveRoute(item.to)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              "
            >
              <span
                v-if="isActiveRoute(item.to)"
                class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600"
              />
              <UIcon :name="item.icon" class="h-4 w-4 shrink-0" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <div class="space-y-1 border-t border-slate-200 p-3">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
          @click="logout"
        >
          <UIcon name="i-lucide-log-out" class="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>

        <NuxtLink
          v-for="item in bottomNavItems"
          :key="item.to"
          :to="item.to"
          class="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="
            isActiveRoute(item.to)
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          "
        >
          <span
            v-if="isActiveRoute(item.to)"
            class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600"
          />
          <UIcon :name="item.icon" class="h-4 w-4 shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Mobile Sidebar Drawer -->
    <USlideover v-model:open="mobileSidebarOpen" side="left" title="Navigasi Taskbir">
      <template #body>
        <nav class="space-y-5">
          <div v-for="group in navGroups" :key="group.label">
            <p class="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {{ group.label }}
            </p>
            <div class="space-y-1">
              <NuxtLink
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                class="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                :class="
                  isActiveRoute(item.to)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                "
              >
                <span
                  v-if="isActiveRoute(item.to)"
                  class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600"
                />
                <UIcon :name="item.icon" class="h-4 w-4 shrink-0" />
                <span>{{ item.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <div class="space-y-1 border-t border-slate-200 pt-3">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
              @click="logout"
            >
              <UIcon name="i-lucide-log-out" class="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </button>

            <NuxtLink
              v-for="item in bottomNavItems"
              :key="item.to"
              :to="item.to"
              class="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              :class="
                isActiveRoute(item.to)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              "
            >
              <span
                v-if="isActiveRoute(item.to)"
                class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600"
              />
              <UIcon :name="item.icon" class="h-4 w-4 shrink-0" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>
        </nav>
      </template>
    </USlideover>

    <!-- Main Area -->
    <div
      class="flex min-w-0 flex-1 flex-col lg:pl-64"
      :class="isViewportLocked ? 'lg:min-h-0 lg:overflow-hidden' : ''"
    >
      <!-- Top Navbar -->
      <header class="relative sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <div class="flex items-center gap-3">
          <UButton
            class="lg:hidden"
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            aria-label="Buka menu"
            @click="mobileSidebarOpen = true"
          />

          <!-- Workspace Switcher -->
          <div v-if="workspaces.length > 0" class="flex items-center gap-2">
            <span class="hidden text-xs font-medium uppercase tracking-wider text-slate-500 xl:inline">
              Workspace
            </span>
            <USelect
              :model-value="activeWorkspace?.id"
              :items="workspaces.map((w) => ({ label: w.name, value: w.id }))"
              size="sm"
              class="w-44 sm:w-56"
              @update:model-value="(val) => val && switchWorkspace(String(val))"
            />
            <UButton
              icon="i-lucide-plus"
              size="sm"
              color="neutral"
              variant="outline"
              title="Buat Workspace Baru"
              aria-label="Buat workspace baru"
              @click="createWsModalOpen = true"
            />
            <UButton
              v-if="isOwner && activeWorkspace"
              icon="i-lucide-pencil"
              size="sm"
              color="neutral"
              variant="ghost"
              title="Ubah Nama Workspace"
              aria-label="Ubah nama workspace"
              @click="openRenameWorkspace"
            />
          </div>
          <UButton
            v-else-if="databaseConfigured"
            icon="i-lucide-plus"
            size="sm"
            color="primary"
            variant="soft"
            @click="createWsModalOpen = true"
          >
            Buat Workspace
          </UButton>
        </div>

        <!-- Centered Company / Agency Identity -->
        <div
          v-if="activeWorkspace"
          class="hidden items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-2xs transition-colors md:pointer-events-auto md:absolute md:left-1/2 md:flex md:-translate-x-1/2"
        >
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
            <UIcon name="i-lucide-building-2" class="h-3 w-3" />
          </span>
          <span class="max-w-56 truncate text-sm font-semibold text-slate-900">
            {{ activeWorkspace.name }}
          </span>
          <UBadge v-if="currentRole" :color="ROLE_META[currentRole].color" variant="subtle" size="xs">
            {{ ROLE_META[currentRole].label }}
          </UBadge>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Notifications Popover -->
          <UPopover>
            <UButton
              icon="i-lucide-bell"
              color="neutral"
              variant="ghost"
              class="relative"
              aria-label="Notifikasi"
            >
              <span
                v-if="unreadCount > 0"
                class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-600"
              />
            </UButton>
            <template #content>
              <div class="w-80 p-3">
                <div class="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span class="text-sm font-semibold text-slate-900">Notifikasi</span>
                  <UBadge v-if="unreadCount > 0" color="primary" variant="subtle" size="xs">
                    {{ unreadCount }} baru
                  </UBadge>
                </div>
                <div v-if="notifications.length === 0" class="py-6 text-center text-xs text-slate-500">
                  Belum ada notifikasi.
                </div>
                <div v-else class="max-h-72 space-y-2 overflow-y-auto">
                  <button
                    v-for="notif in notifications"
                    :key="notif.id"
                    type="button"
                    class="w-full rounded-lg p-2 text-left transition-colors hover:bg-slate-50"
                    :class="notif.isRead ? 'opacity-65' : 'bg-indigo-50/40'"
                    @click="markAsRead(notif.id)"
                  >
                    <p class="text-xs font-semibold text-slate-900">{{ notif.title }}</p>
                    <p v-if="notif.message" class="mt-0.5 text-xs text-slate-600">
                      {{ notif.message }}
                    </p>
                  </button>
                </div>
              </div>
            </template>
          </UPopover>

          <!-- User Menu -->
          <div v-if="user" class="flex items-center gap-2.5 border-l border-slate-200 pl-3">
            <UAvatar :alt="user.name" size="sm" class="bg-indigo-100 text-indigo-700" />
            <div class="hidden text-left sm:block">
              <p class="text-xs font-semibold leading-none text-slate-900">{{ user.name }}</p>
              <p class="mt-0.5 text-[11px] leading-none text-slate-500">{{ user.email }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main
        class="flex-1 p-4 sm:p-6"
        :class="isViewportLocked ? 'lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden lg:p-5' : 'lg:p-8'"
      >
        <UAlert
          v-if="!databaseConfigured"
          class="mb-4 shrink-0"
          color="primary"
          variant="subtle"
          icon="i-lucide-eye"
          title="Mode Preview UI (Data Dummy Aktif)"
          description="Anda sedang melihat tampilan Taskbir dengan data contoh interaktif. Untuk menyimpan permanen ke TiDB, isi .env dan jalankan npm run db:migrate."
        />
        <slot />
      </main>
    </div>

    <!-- Modal Buat Workspace -->
    <CreateWorkspaceModal v-model:open="createWsModalOpen" />

    <!-- Modal Ubah Nama Workspace -->
    <AppModal
      :open="renameWsModalOpen"
      title="Ubah Nama Workspace"
      description="Nama baru akan tampil di navbar dan seluruh halaman workspace ini."
      max-width="sm"
      @update:open="(val) => (renameWsModalOpen = val)"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="handleRenameWorkspace">
          <UFormField label="Nama Workspace" required>
            <UInput
              v-model="renameWsName"
              placeholder="Mis. PT Maju Bersama"
              class="w-full"
              required
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              @click="renameWsModalOpen = false"
            >
              Batal
            </UButton>
            <UButton type="submit" color="primary" :loading="renamingWs">
              Simpan
            </UButton>
          </div>
        </form>
      </template>
    </AppModal>
  </div>
</template>
