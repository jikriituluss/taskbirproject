<script setup lang="ts">
import { PROJECT_STATUS_META, formatDateId } from '~/composables/useFormatters'
import type { ProjectStatus } from '../../shared/types/domain'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { activeWorkspace } = useTaskoraSession()

interface ReportsResponse {
  metrics: {
    totalProjects: number
    totalTasks: number
    completedTasks: number
    incompleteTasks: number
    overdueTasksCount: number
  }
  projectProgress: Array<{
    id: string
    name: string
    status: ProjectStatus
    totalTasks: number
    completedTasks: number
    incompleteTasks: number
    overdueTasks: number
    progressPercentage: number
    dueDate: string | null
  }>
}

const loading = ref(true)
const errorMsg = ref('')
const report = ref<ReportsResponse | null>(null)

async function loadReport() {
  if (!activeWorkspace.value) {
    loading.value = false
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    report.value = await $fetch<ReportsResponse>(
      `/api/workspaces/${activeWorkspace.value.id}/reports`
    )
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal memuat laporan.'
  } finally {
    loading.value = false
  }
}

watch(
  () => activeWorkspace.value?.id,
  () => {
    loadReport()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
      <p class="mt-0.5 text-sm text-slate-500">
        Ringkasan kinerja proyek, penyelesaian tugas, dan keterlambatan di workspace ini.
      </p>
    </div>

    <UAlert
      v-if="errorMsg"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      :title="errorMsg"
    >
      <template #actions>
        <UButton size="xs" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadReport">
          Coba lagi
        </UButton>
      </template>
    </UAlert>

    <div v-else-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>

    <template v-else-if="report">
      <div class="grid divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-2xs sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        <div class="p-4 sm:p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Jumlah Proyek</p>
          <p class="mt-1.5 text-2xl font-bold text-slate-900">
            {{ report.metrics.totalProjects }}
          </p>
        </div>
        <div class="p-4 sm:p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Tugas Selesai</p>
          <p class="mt-1.5 text-2xl font-bold text-emerald-700">
            {{ report.metrics.completedTasks }}
          </p>
        </div>
        <div class="p-4 sm:p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Belum Selesai</p>
          <p class="mt-1.5 text-2xl font-bold text-indigo-700">
            {{ report.metrics.incompleteTasks }}
          </p>
        </div>
        <div class="p-4 sm:p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Tugas Terlambat</p>
          <p class="mt-1.5 text-2xl font-bold text-rose-600">
            {{ report.metrics.overdueTasksCount }}
          </p>
        </div>
      </div>

      <UCard :ui="{ body: 'p-0' }">
        <template #header>
          <h2 class="text-base font-semibold text-slate-900">Persentase Progres Proyek</h2>
        </template>

        <div v-if="report.projectProgress.length === 0" class="p-8 text-center text-sm text-slate-500">
          Belum ada data proyek untuk dilaporkan.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th class="px-4 py-3">Proyek</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Selesai / Total</th>
                <th class="px-4 py-3">Terlambat</th>
                <th class="px-4 py-3">Deadline</th>
                <th class="px-4 py-3">Progres</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="p in report.projectProgress" :key="p.id">
                <td class="px-4 py-3 font-medium text-slate-900">
                  <NuxtLink :to="`/projects/${p.id}`" class="hover:text-indigo-600">
                    {{ p.name }}
                  </NuxtLink>
                </td>
                <td class="px-4 py-3">
                  <UBadge :color="PROJECT_STATUS_META[p.status].color" variant="subtle" size="xs">
                    {{ PROJECT_STATUS_META[p.status].label }}
                  </UBadge>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  {{ p.completedTasks }} / {{ p.totalTasks }}
                </td>
                <td class="px-4 py-3">
                  <span :class="p.overdueTasks > 0 ? 'font-semibold text-rose-600' : 'text-slate-500'">
                    {{ p.overdueTasks }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs text-slate-500">{{ formatDateId(p.dueDate) }}</td>
                <td class="w-48 px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        class="h-full rounded-full bg-indigo-600"
                        :style="{ width: `${p.progressPercentage}%` }"
                      />
                    </div>
                    <span class="w-9 text-right text-xs font-semibold text-slate-900">
                      {{ p.progressPercentage }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>
  </div>
</template>
