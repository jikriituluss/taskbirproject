<script setup lang="ts">
import {
  TASK_PRIORITY_META,
  TASK_STATUS_META,
  formatDateId,
  formatDateTimeId,
  isOverdue
} from '~/composables/useFormatters'
import type { TaskStatus, TaskPriority } from '../../shared/types/domain'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { activeWorkspace, databaseConfigured } = useTaskoraSession()

interface DashboardResponse {
  summary: {
    totalProjects: number
    activeProjects: number
    totalTasks: number
    completedTasks: number
    overdueCount: number
    completionRate: number
  }
  statusBreakdown: {
    todo: number
    in_progress: number
    review: number
    done: number
  }
  upcomingDeadlines: Array<{
    id: string
    title: string
    projectName: string
    status: TaskStatus
    priority: TaskPriority
    dueDate: string
    assigneeName: string | null
  }>
  recentActivities: Array<{
    id: string
    title: string
    projectName: string
    status: TaskStatus
    assigneeName: string | null
    updatedAt: string
  }>
}

const loading = ref(true)
const errorMsg = ref('')
const dashboard = ref<DashboardResponse | null>(null)
const createWsOpen = ref(false)
const activeTab = ref<'deadlines' | 'activity'>('deadlines')
const deadlinePriorityFilter = ref<'all' | 'urgent' | 'high'>('all')

const filteredDeadlines = computed(() => {
  const list = dashboard.value?.upcomingDeadlines || []
  if (deadlinePriorityFilter.value === 'all') return list
  return list.filter((t) => t.priority === deadlinePriorityFilter.value)
})

async function loadDashboard() {
  if (!activeWorkspace.value) {
    loading.value = false
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    dashboard.value = await $fetch<DashboardResponse>(
      `/api/workspaces/${activeWorkspace.value.id}/dashboard`
    )
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal memuat dashboard.'
  } finally {
    loading.value = false
  }
}

watch(
  () => activeWorkspace.value?.id,
  () => {
    loadDashboard()
  },
  { immediate: true }
)

const onboardingSteps = [
  {
    title: 'Buat proyek pertama',
    description: 'Kelompokkan pekerjaan per klien atau tim agar rapi.',
    cta: 'Buat Proyek',
    to: '/projects'
  },
  {
    title: 'Tambahkan tugas',
    description: 'Tentukan penanggung jawab, prioritas, dan deadline.',
    cta: 'Buka Kanban',
    to: '/kanban'
  },
  {
    title: 'Ajak anggota tim',
    description: 'Undang anggota dan bagi peran agar beban kerja merata.',
    cta: 'Kelola Team',
    to: '/team'
  },
  {
    title: 'Pantau progres',
    description: 'Lihat ringkasan penyelesaian dan tugas terlambat.',
    cta: 'Buka Reports',
    to: '/reports'
  }
]

const breakdownRows = computed(() => {
  if (!dashboard.value) return []
  const total = dashboard.value.summary.totalTasks || 1
  const b = dashboard.value.statusBreakdown
  return [
    { key: 'todo', label: 'To Do', count: b.todo, color: 'bg-slate-400', pct: Math.round((b.todo / total) * 100) },
    { key: 'in_progress', label: 'In Progress', count: b.in_progress, color: 'bg-indigo-500', pct: Math.round((b.in_progress / total) * 100) },
    { key: 'review', label: 'Review', count: b.review, color: 'bg-amber-500', pct: Math.round((b.review / total) * 100) },
    { key: 'done', label: 'Done', count: b.done, color: 'bg-emerald-500', pct: Math.round((b.done / total) * 100) }
  ]
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Ringkasan proyek, tugas, dan progres kerja di
          <span class="font-medium text-slate-700">{{ activeWorkspace?.name }}</span>.
        </p>
      </div>
      <div v-if="activeWorkspace" class="flex gap-2">
        <UButton to="/projects" color="primary" icon="i-lucide-folder-plus">
          Kelola Proyek
        </UButton>
        <UButton to="/kanban" color="neutral" variant="outline" icon="i-lucide-columns-3">
          Buka Kanban
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="errorMsg"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      :title="errorMsg"
    >
      <template #actions>
        <UButton size="xs" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadDashboard">
          Coba lagi
        </UButton>
      </template>
    </UAlert>

    <div v-else-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>

    <!-- Belum ada workspace -->
    <UCard v-else-if="!activeWorkspace">
      <div class="py-10 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <UIcon name="i-lucide-layout-dashboard" class="h-6 w-6" />
        </div>
        <p class="mt-4 text-base font-semibold text-slate-900">Selamat datang di Taskora</p>
        <p class="mx-auto mt-1 max-w-md text-sm text-slate-500">
          Workspace adalah ruang kerja terpisah untuk setiap klien atau tim. Buat workspace
          pertama Anda untuk mulai mengelola proyek dan tugas.
        </p>
        <UButton
          class="mt-5"
          color="primary"
          icon="i-lucide-plus"
          :disabled="!databaseConfigured"
          @click="createWsOpen = true"
        >
          Buat Workspace Pertama
        </UButton>
      </div>
    </UCard>

    <template v-else-if="dashboard">
      <!-- Asymmetric Focal Strip: Progress Hero (2/3) + Compact Metric Stack (1/3) -->
      <div class="grid gap-5 lg:grid-cols-3">
        <div
          class="flex flex-col justify-between rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/60 p-6 shadow-xs lg:col-span-2"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Progres Penyelesaian Workspace
              </p>
              <div class="mt-2 flex items-baseline gap-3">
                <span class="text-4xl font-bold tracking-tight text-slate-900">
                  {{ dashboard.summary.completionRate }}%
                </span>
                <span class="text-sm font-medium text-slate-600">
                  {{ dashboard.summary.completedTasks }} dari {{ dashboard.summary.totalTasks }} tugas selesai
                </span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton to="/my-tasks" size="xs" color="primary" variant="soft" icon="i-lucide-check-square">
                My Tasks
              </UButton>
              <UButton to="/projects" size="xs" color="neutral" variant="outline" icon="i-lucide-folder-kanban">
                Projects
              </UButton>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div class="flex h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
              <div
                v-for="row in breakdownRows"
                :key="row.key"
                :class="row.color"
                class="transition-all duration-300"
                :style="{ width: `${row.pct}%` }"
                :title="`${row.label}: ${row.count} tugas (${row.pct}%)`"
              />
            </div>

            <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <div v-for="row in breakdownRows" :key="row.key" class="flex items-center gap-1.5">
                <span class="h-2.5 w-2.5 rounded-full" :class="row.color" />
                <span class="font-medium text-slate-700">{{ row.label }}:</span>
                <span class="font-semibold text-slate-900">{{ row.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col justify-between divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <NuxtLink
            to="/projects"
            class="flex items-center justify-between py-3 first:pt-0 transition-colors hover:text-indigo-700"
          >
            <div>
              <p class="text-xs font-medium text-slate-500">Proyek Aktif</p>
              <p class="mt-0.5 text-xl font-bold text-slate-900">
                {{ dashboard.summary.activeProjects }}
                <span class="text-xs font-normal text-slate-500">/ {{ dashboard.summary.totalProjects }} total</span>
              </p>
            </div>
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <UIcon name="i-lucide-folder-kanban" class="h-5 w-5" />
            </span>
          </NuxtLink>

          <NuxtLink
            to="/my-tasks"
            class="flex items-center justify-between py-3 transition-colors hover:text-amber-700"
          >
            <div>
              <p class="text-xs font-medium text-slate-500">Menunggu Review</p>
              <p class="mt-0.5 text-xl font-bold text-amber-700">
                {{ dashboard.statusBreakdown.review }}
                <span class="text-xs font-normal text-slate-500">tugas</span>
              </p>
            </div>
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <UIcon name="i-lucide-eye" class="h-5 w-5" />
            </span>
          </NuxtLink>

          <NuxtLink
            to="/my-tasks"
            class="flex items-center justify-between py-3 last:pb-0 transition-colors hover:text-rose-700"
          >
            <div>
              <p class="text-xs font-medium text-slate-500">Tugas Terlambat</p>
              <p
                class="mt-0.5 text-xl font-bold"
                :class="dashboard.summary.overdueCount > 0 ? 'text-rose-600' : 'text-emerald-700'"
              >
                {{ dashboard.summary.overdueCount }}
                <span class="text-xs font-normal text-slate-500">
                  {{ dashboard.summary.overdueCount > 0 ? 'perlu perhatian' : 'aman' }}
                </span>
              </p>
            </div>
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl"
              :class="dashboard.summary.overdueCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'"
            >
              <UIcon
                :name="dashboard.summary.overdueCount > 0 ? 'i-lucide-alert-triangle' : 'i-lucide-check-circle-2'"
                class="h-5 w-5"
              />
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Onboarding bila belum ada proyek -->
      <UCard v-if="dashboard.summary.totalProjects === 0">
        <template #header>
          <div>
            <h2 class="text-base font-semibold text-slate-900">Mulai dari sini</h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Empat langkah singkat untuk mulai bekerja di workspace ini.
            </p>
          </div>
        </template>

        <ol class="divide-y divide-slate-100">
          <li v-for="(step, idx) in onboardingSteps" :key="step.title" class="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600"
            >
              {{ idx + 1 }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-900">{{ step.title }}</p>
              <p class="text-xs text-slate-500">{{ step.description }}</p>
            </div>
            <UButton :to="step.to" size="xs" color="primary" variant="soft" trailing-icon="i-lucide-arrow-right">
              {{ step.cta }}
            </UButton>
          </li>
        </ol>
      </UCard>

      <template v-else>
        <!-- Interactive Tabbed Feed: Deadline Mendekat & Aktivitas Terbaru -->
        <UCard :ui="{ body: 'p-0' }">
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div
                class="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1"
                role="tablist"
                aria-label="Feed Dashboard"
              >
                <button
                  type="button"
                  role="tab"
                  :aria-selected="activeTab === 'deadlines'"
                  class="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors"
                  :class="
                    activeTab === 'deadlines'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  "
                  @click="activeTab = 'deadlines'"
                >
                  Deadline Mendekat ({{ dashboard.upcomingDeadlines.length }})
                </button>
                <button
                  type="button"
                  role="tab"
                  :aria-selected="activeTab === 'activity'"
                  class="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors"
                  :class="
                    activeTab === 'activity'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  "
                  @click="activeTab = 'activity'"
                >
                  Aktivitas Terbaru ({{ dashboard.recentActivities.length }})
                </button>
              </div>

              <div v-if="activeTab === 'deadlines'" class="flex flex-wrap items-center gap-1.5">
                <button
                  v-for="f in [
                    { key: 'all', label: 'Semua' },
                    { key: 'urgent', label: 'Mendesak' },
                    { key: 'high', label: 'Tinggi' }
                  ] as const"
                  :key="f.key"
                  type="button"
                  class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                  :class="
                    deadlinePriorityFilter === f.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  "
                  @click="deadlinePriorityFilter = f.key"
                >
                  {{ f.label }}
                </button>
              </div>
            </div>
          </template>

          <div v-if="activeTab === 'deadlines'">
            <div v-if="filteredDeadlines.length === 0" class="py-10 text-center text-sm text-slate-500">
              Tidak ada tugas dengan filter deadline ini.
            </div>

            <div v-else class="divide-y divide-slate-100">
              <NuxtLink
                v-for="t in filteredDeadlines"
                :key="t.id"
                to="/my-tasks"
                class="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-indigo-50/40"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-slate-900">{{ t.title }}</p>
                  <p class="text-xs text-slate-500">
                    {{ t.projectName }}
                    <span v-if="t.assigneeName">· {{ t.assigneeName }}</span>
                  </p>
                </div>
                <div class="flex shrink-0 items-center gap-2.5">
                  <UBadge :color="TASK_PRIORITY_META[t.priority].color" variant="subtle" size="xs">
                    {{ TASK_PRIORITY_META[t.priority].label }}
                  </UBadge>
                  <span
                    class="text-xs font-semibold"
                    :class="isOverdue(t.dueDate, t.status) ? 'text-rose-600' : 'text-slate-600'"
                  >
                    {{ formatDateTimeId(t.dueDate) }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div v-else>
            <div v-if="dashboard.recentActivities.length === 0" class="py-10 text-center text-sm text-slate-500">
              Belum ada aktivitas terbaru dalam 24 jam terakhir.
            </div>

            <div v-else class="divide-y divide-slate-100">
              <NuxtLink
                v-for="act in dashboard.recentActivities"
                :key="act.id"
                to="/kanban"
                class="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-indigo-50/40"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-slate-900">{{ act.title }}</p>
                  <p class="text-xs text-slate-500">
                    Proyek {{ act.projectName }}
                    <span v-if="act.assigneeName">· Penanggung jawab: {{ act.assigneeName }}</span>
                  </p>
                </div>
                <div class="flex shrink-0 items-center gap-2.5">
                  <UBadge :color="TASK_STATUS_META[act.status].color" variant="subtle" size="xs">
                    {{ TASK_STATUS_META[act.status].label }}
                  </UBadge>
                  <span class="hidden text-xs text-slate-500 sm:inline">
                    {{ formatDateId(act.updatedAt) }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </UCard>
      </template>
    </template>

    <!-- Modal Buat Workspace -->
    <CreateWorkspaceModal v-model:open="createWsOpen" />
  </div>
</template>
