<script setup lang="ts">
import {
  TASK_PRIORITY_META,
  TASK_STATUS_META,
  formatDateTimeId,
  isOverdue
} from '~/composables/useFormatters'
import type { TaskPriority, TaskStatus } from '../../shared/types/domain'
import type { SimpleMember, SimpleProject, TaskItem } from '~/components/TaskDetailModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const toast = useToast()
const { user, activeWorkspace } = useTaskoraSession()

const loading = ref(true)
const errorMsg = ref('')
const tasks = ref<TaskItem[]>([])
const projects = ref<SimpleProject[]>([])
const members = ref<SimpleMember[]>([])

const statusFilter = ref<string>('all')
const priorityFilter = ref<string>('all')

const modalOpen = ref(false)
const selectedTask = ref<TaskItem | null>(null)
const previewImage = ref<string | null>(null)
const previewOpen = computed({
  get: () => Boolean(previewImage.value),
  set: (val: boolean) => {
    if (!val) previewImage.value = null
  }
})

async function loadData() {
  if (!activeWorkspace.value || !user.value) {
    loading.value = false
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const wsId = activeWorkspace.value.id
    const [taskRes, projRes, memRes] = await Promise.all([
      $fetch<{ tasks: TaskItem[] }>(`/api/workspaces/${wsId}/tasks`, {
        query: { assigneeId: user.value.id }
      }),
      $fetch<{ projects: SimpleProject[] }>(`/api/workspaces/${wsId}/projects`),
      $fetch<{ members: SimpleMember[] }>(`/api/workspaces/${wsId}/members`)
    ])
    tasks.value = taskRes.tasks || []
    projects.value = projRes.projects || []
    members.value = memRes.members || []
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal memuat tugas.'
  } finally {
    loading.value = false
  }
}

const filteredTasks = computed(() =>
  tasks.value.filter((t) => {
    if (statusFilter.value !== 'all' && t.status !== statusFilter.value) return false
    if (priorityFilter.value !== 'all' && t.priority !== priorityFilter.value) return false
    return true
  })
)

function resetFilters() {
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
}

const savingStatusId = ref<string | null>(null)

async function confirmStatusChange(task: TaskItem, nextStatus: TaskStatus) {
  if (!activeWorkspace.value || nextStatus === task.status) return

  savingStatusId.value = task.id
  try {
    await $fetch(`/api/workspaces/${activeWorkspace.value.id}/tasks/${task.id}`, {
      method: 'PATCH',
      body: { status: nextStatus }
    })
    task.status = nextStatus
    toast.add({ title: 'Status tugas diperbarui', color: 'success' })
  } catch (err: any) {
    toast.add({
      title: 'Gagal mengubah status',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    savingStatusId.value = null
  }
}

function openCreateTask() {
  selectedTask.value = null
  modalOpen.value = true
}

function openEditTask(task: TaskItem) {
  selectedTask.value = task
  modalOpen.value = true
}

watch(
  () => activeWorkspace.value?.id,
  () => {
    loadData()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">My Tasks</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Daftar tugas yang menjadi tanggung jawab Anda.
        </p>
      </div>
      <UButton
        v-if="projects.length > 0"
        color="primary"
        icon="i-lucide-plus"
        @click="openCreateTask"
      >
        Buat Tugas
      </UButton>
      <UButton v-else to="/projects" color="primary" icon="i-lucide-folder-plus">
        Buat Proyek Dahulu
      </UButton>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <USelect
        v-model="statusFilter"
        :items="[
          { label: 'Semua Status', value: 'all' },
          ...Object.entries(TASK_STATUS_META).map(([value, m]) => ({ label: m.label, value }))
        ]"
        size="sm"
        class="w-40"
      />
      <USelect
        v-model="priorityFilter"
        :items="[
          { label: 'Semua Prioritas', value: 'all' },
          ...Object.entries(TASK_PRIORITY_META).map(([value, m]) => ({ label: m.label, value }))
        ]"
        size="sm"
        class="w-40"
      />
    </div>

    <UAlert
      v-if="errorMsg"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      :title="errorMsg"
    >
      <template #actions>
        <UButton size="xs" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadData">
          Coba lagi
        </UButton>
      </template>
    </UAlert>

    <div v-else-if="loading" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-14 rounded-xl" />
    </div>

    <UCard v-else-if="tasks.length === 0">
      <div class="py-10 text-center">
        <UIcon name="i-lucide-check-circle-2" class="mx-auto h-10 w-10 text-slate-300" />
        <p class="mt-3 text-sm font-medium text-slate-900">Belum ada tugas untuk Anda</p>
        <p class="mx-auto mt-1 max-w-sm text-xs text-slate-500">
          {{
            projects.length === 0
              ? 'Tugas baru bisa dibuat setelah ada proyek. Buat proyek pertama Anda untuk memulai.'
              : 'Tugas yang ditugaskan kepada Anda akan tampil di halaman ini. Anda juga bisa melihat seluruh tugas di papan Kanban.'
          }}
        </p>
        <UButton
          v-if="projects.length === 0"
          class="mt-4"
          color="primary"
          icon="i-lucide-folder-plus"
          to="/projects"
        >
          Buat Proyek Pertama
        </UButton>
        <UButton v-else class="mt-4" color="neutral" variant="outline" icon="i-lucide-columns-3" to="/kanban">
          Buka Kanban
        </UButton>
      </div>
    </UCard>

    <UCard v-else-if="filteredTasks.length === 0">
      <div class="py-10 text-center">
        <UIcon name="i-lucide-filter-x" class="mx-auto h-10 w-10 text-slate-300" />
        <p class="mt-3 text-sm font-medium text-slate-900">Tidak ada tugas yang cocok</p>
        <p class="mt-1 text-xs text-slate-500">
          Ubah atau reset filter status dan prioritas untuk melihat tugas lainnya.
        </p>
        <UButton
          class="mt-4"
          color="neutral"
          variant="outline"
          icon="i-lucide-rotate-ccw"
          @click="resetFilters"
        >
          Reset Filter
        </UButton>
      </div>
    </UCard>

    <UCard v-else :ui="{ body: 'p-0' }">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th class="px-4 py-3">Tugas</th>
              <th class="px-4 py-3">Proyek</th>
              <th class="px-4 py-3">Prioritas</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Bukti</th>
              <th class="px-4 py-3">Deadline</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="t in filteredTasks" :key="t.id" class="hover:bg-slate-50/70">
              <td class="px-4 py-3 font-medium text-slate-900">
                <button type="button" class="text-left hover:text-indigo-600" @click="openEditTask(t)">
                  {{ t.title }}
                </button>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ t.projectName }}</td>
              <td class="px-4 py-3">
                <UBadge :color="TASK_PRIORITY_META[t.priority as TaskPriority].color" variant="subtle" size="xs">
                  {{ TASK_PRIORITY_META[t.priority as TaskPriority].label }}
                </UBadge>
              </td>
              <td class="px-4 py-3">
                <InlineConfirmSelect
                  :model-value="t.status"
                  :items="
                    Object.entries(TASK_STATUS_META).map(([value, m]) => ({
                      label: m.label,
                      value
                    }))
                  "
                  :saving="savingStatusId === t.id"
                  select-class="w-32"
                  confirm-label="Simpan perubahan status"
                  @confirm="(val) => confirmStatusChange(t, val as TaskStatus)"
                />
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  <a
                    v-if="t.proofUrl"
                    :href="t.proofUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    <UIcon name="i-lucide-link" class="h-3 w-3" />
                    Link
                  </a>
                  <button
                    v-if="t.proofImage"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    @click="previewImage = t.proofImage"
                  >
                    <UIcon name="i-lucide-image" class="h-3 w-3" />
                    Foto
                  </button>
                  <button
                    v-if="!t.proofUrl && !t.proofImage"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600"
                    @click="openEditTask(t)"
                  >
                    <UIcon name="i-lucide-paperclip" class="h-3 w-3" />
                    Lampirkan
                  </button>
                </div>
              </td>
              <td
                class="px-4 py-3 text-xs font-medium"
                :class="isOverdue(t.dueDate, t.status) ? 'text-rose-600' : 'text-slate-600'"
              >
                {{ formatDateTimeId(t.dueDate) }}
              </td>
              <td class="px-4 py-3 text-right">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-pencil"
                  @click="openEditTask(t)"
                >
                  Detail
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <TaskDetailModal
      v-if="activeWorkspace"
      v-model:open="modalOpen"
      :workspace-id="activeWorkspace.id"
      :task="selectedTask"
      :projects="projects"
      :members="members"
      @saved="loadData"
      @deleted="loadData"
    />

    <ProofImageModal
      :src="previewImage"
      title="Preview Foto Bukti"
      @close="previewImage = null"
    />
  </div>
</template>
