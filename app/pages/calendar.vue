<script setup lang="ts">
import type { TaskPriority, TaskStatus } from '../../shared/types/domain'
import { TASK_STATUS_META } from '~/composables/useFormatters'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { activeWorkspace } = useTaskoraSession()

interface CalendarTask {
  id: string
  title: string
  projectName: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
}

interface CalendarProject {
  id: string
  name: string
  startDate: string | null
  dueDate: string | null
}

const currentMonth = ref(new Date())
const loading = ref(true)
const errorMsg = ref('')
const tasks = ref<CalendarTask[]>([])
const projects = ref<CalendarProject[]>([])

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentMonth.value)
)

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDayOfWeek = firstDay.getDay() // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Array<{ dateStr: string | null; day: number | null }> = []
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ dateStr: null, day: null })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    cells.push({ dateStr: `${year}-${mm}-${dd}`, day: d })
  }
  return cells
})

function prevMonth() {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1
  )
}

function nextMonth() {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1
  )
}

function getItemsForDate(dateStr: string) {
  const dayTasks = tasks.value.filter(
    (t) => t.dueDate && new Date(t.dueDate).toISOString().slice(0, 10) === dateStr
  )
  const dayProjects = projects.value.filter(
    (p) => p.dueDate && new Date(p.dueDate).toISOString().slice(0, 10) === dateStr
  )
  return { dayTasks, dayProjects }
}

async function loadCalendar() {
  if (!activeWorkspace.value) {
    loading.value = false
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const wsId = activeWorkspace.value.id
    const [taskRes, projRes] = await Promise.all([
      $fetch<{ tasks: CalendarTask[] }>(`/api/workspaces/${wsId}/tasks`),
      $fetch<{ projects: CalendarProject[] }>(`/api/workspaces/${wsId}/projects`)
    ])
    tasks.value = taskRes.tasks || []
    projects.value = projRes.projects || []
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal memuat kalender.'
  } finally {
    loading.value = false
  }
}

function isToday(dateStr: string | null) {
  if (!dateStr) return false
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return dateStr === `${y}-${m}-${d}`
}

const weekRowCount = computed(() => Math.max(5, Math.ceil(calendarDays.value.length / 7)))

watch(
  () => activeWorkspace.value?.id,
  () => {
    loadCalendar()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:space-y-3 lg:overflow-hidden">
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3.5">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <UIcon name="i-lucide-calendar" class="h-5 w-5" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Calendar</h1>
          <p class="text-xs text-slate-500 sm:text-sm">
            Pantau deadline tugas dan jadwal deadline proyek dalam tampilan kalender.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-2xs">
        <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" size="xs" aria-label="Bulan sebelumnya" @click="prevMonth" />
        <span class="min-w-36 text-center text-sm font-semibold capitalize text-slate-900">
          {{ monthLabel }}
        </span>
        <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="xs" aria-label="Bulan berikutnya" @click="nextMonth" />
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
        <UButton size="xs" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadCalendar">
          Coba lagi
        </UButton>
      </template>
    </UAlert>

    <USkeleton v-else-if="loading" class="h-[520px] rounded-xl" />

    <template v-else>
      <UAlert
        v-if="tasks.length === 0 && projects.length === 0"
        class="mb-4"
        color="neutral"
        variant="subtle"
        icon="i-lucide-calendar"
        title="Belum ada jadwal di kalender"
        description="Deadline tugas dan rentang jadwal proyek akan otomatis muncul di sini setelah Anda menambahkannya."
      >
        <template #actions>
          <UButton size="xs" color="primary" variant="soft" to="/projects">
            Kelola Proyek
          </UButton>
        </template>
      </UAlert>

      <div
        class="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
      >
        <div class="grid shrink-0 grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-semibold uppercase text-slate-500">
          <div v-for="d in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']" :key="d" class="py-1.5">
            {{ d }}
          </div>
        </div>

        <div
          class="grid grid-cols-7 divide-x divide-y divide-slate-200 lg:min-h-0 lg:flex-1"
          :style="{ gridTemplateRows: `repeat(${weekRowCount}, minmax(0, 1fr))` }"
        >
          <div
            v-for="(cell, idx) in calendarDays"
            :key="idx"
            class="min-h-20 overflow-y-auto p-1.5 lg:min-h-0"
            :class="cell.day ? 'bg-white' : 'bg-slate-50/70'"
          >
            <template v-if="cell.dateStr && cell.day">
              <div class="flex items-center justify-between">
                <span
                  class="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold"
                  :class="isToday(cell.dateStr) ? 'bg-indigo-600 text-white' : 'text-slate-700'"
                >
                  {{ cell.day }}
                </span>
              </div>
              <div class="mt-1 space-y-1">
                <NuxtLink
                  v-for="proj in getItemsForDate(cell.dateStr).dayProjects"
                  :key="proj.id"
                  :to="`/projects/${proj.id}`"
                  class="block truncate rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-200"
                >
                  Proyek: {{ proj.name }}
                </NuxtLink>

                <div
                  v-for="t in getItemsForDate(cell.dateStr).dayTasks"
                  :key="t.id"
                  class="truncate rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-800"
                  :title="`${t.title} (${TASK_STATUS_META[t.status].label})`"
                >
                  {{ t.title }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
