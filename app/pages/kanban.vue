<script setup lang="ts">
import { TASK_STATUSES, type TaskStatus } from '#shared/types/domain'
import {
  TASK_PRIORITY_META,
  TASK_STATUS_META,
  formatDateTimeId,
  isOverdue
} from '~/composables/useFormatters'
import type { SimpleMember, SimpleProject, TaskItem } from '~/components/TaskDetailModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const toast = useToast()
const { activeWorkspace } = useTaskoraSession()

const loading = ref(true)
const errorMsg = ref('')
const tasks = ref<TaskItem[]>([])
const projects = ref<SimpleProject[]>([])
const members = ref<SimpleMember[]>([])
const selectedProjectId = ref('all')

const modalOpen = ref(false)
const selectedTask = ref<TaskItem | null>(null)
const draggedTaskId = ref<string | null>(null)
const dragOverColumn = ref<TaskStatus | null>(null)

async function loadBoard() {
  if (!activeWorkspace.value) {
    loading.value = false
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const wsId = activeWorkspace.value.id
    const [taskRes, projRes, memRes] = await Promise.all([
      $fetch<{ tasks: TaskItem[] }>(`/api/workspaces/${wsId}/tasks`),
      $fetch<{ projects: SimpleProject[] }>(`/api/workspaces/${wsId}/projects`),
      $fetch<{ members: SimpleMember[] }>(`/api/workspaces/${wsId}/members`)
    ])
    tasks.value = taskRes.tasks || []
    projects.value = projRes.projects || []
    members.value = memRes.members || []
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal memuat papan Kanban.'
  } finally {
    loading.value = false
  }
}

const filteredTasks = computed(() => {
  if (selectedProjectId.value === 'all') return tasks.value
  return tasks.value.filter((t) => t.projectId === selectedProjectId.value)
})

function tasksInColumn(status: TaskStatus) {
  return filteredTasks.value.filter((t) => t.status === status)
}

function onDragStart(taskId: string) {
  draggedTaskId.value = taskId
}

function onDragOver(event: DragEvent, status: TaskStatus) {
  event.preventDefault()
  dragOverColumn.value = status
}

function onDragLeave() {
  dragOverColumn.value = null
}

async function onDrop(targetStatus: TaskStatus) {
  dragOverColumn.value = null
  const taskId = draggedTaskId.value
  draggedTaskId.value = null
  if (!taskId || !activeWorkspace.value) return

  const task = tasks.value.find((t) => t.id === taskId)
  if (!task) return

  const previousStatus = task.status
  if (previousStatus === targetStatus) return

  // Optimistic update
  task.status = targetStatus

  const updatedColTasks = tasks.value
    .filter((t) => t.status === targetStatus)
    .map((t, idx) => ({
      id: t.id,
      status: targetStatus,
      position: idx
    }))

  try {
    await $fetch(`/api/workspaces/${activeWorkspace.value.id}/tasks/reorder`, {
      method: 'PATCH',
      body: { items: updatedColTasks }
    })
    toast.add({
      title: `Tugas dipindahkan ke ${TASK_STATUS_META[targetStatus].label}`,
      color: 'success'
    })
  } catch (err: any) {
    task.status = previousStatus
    toast.add({
      title: 'Gagal memindahkan tugas',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
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
    loadBoard()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Kanban Board</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Seret dan lepas (drag-and-drop) kartu tugas untuk mengubah status secara langsung.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <USelect
          v-model="selectedProjectId"
          :items="[
            { label: 'Semua Proyek', value: 'all' },
            ...projects.map((p) => ({ label: p.name, value: p.id }))
          ]"
          size="sm"
          class="w-48"
        />
        <UButton
          v-if="projects.length > 0"
          color="primary"
          icon="i-lucide-plus"
          @click="openCreateTask"
        >
          Tambah Tugas
        </UButton>
        <UButton v-else to="/projects" color="primary" icon="i-lucide-folder-plus">
          Buat Proyek Dahulu
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
        <UButton size="xs" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadBoard">
          Coba lagi
        </UButton>
      </template>
    </UAlert>

    <div v-else-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <USkeleton v-for="i in 4" :key="i" class="h-96 rounded-xl" />
    </div>

    <UCard v-else-if="tasks.length === 0">
      <div class="py-12 text-center">
        <UIcon name="i-lucide-columns-3" class="mx-auto h-10 w-10 text-slate-300" />
        <p class="mt-3 text-sm font-medium text-slate-900">
          {{
            projects.length === 0
              ? 'Belum ada proyek di workspace ini'
              : 'Belum ada tugas di papan Kanban'
          }}
        </p>
        <p class="mx-auto mt-1 max-w-sm text-xs text-slate-500">
          {{
            projects.length === 0
              ? 'Buat proyek terlebih dahulu, lalu tambahkan tugas untuk mulai menyusun papan Kanban.'
              : 'Tambahkan tugas pertama, lalu seret kartunya antar kolom untuk mengubah status.'
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
        <UButton v-else class="mt-4" color="primary" icon="i-lucide-plus" @click="openCreateTask">
          Tambah Tugas Pertama
        </UButton>
      </div>
    </UCard>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="col in TASK_STATUSES"
        :key="col"
        class="flex min-h-[420px] flex-col rounded-xl border bg-slate-100/70 p-3 transition-colors"
        :class="
          dragOverColumn === col
            ? 'border-indigo-400 bg-indigo-50/50'
            : 'border-slate-200'
        "
        @dragover="onDragOver($event, col)"
        @dragleave="onDragLeave"
        @drop="onDrop(col)"
      >
        <div class="mb-3 flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :class="TASK_STATUS_META[col].dot" />
            <h2 class="text-sm font-semibold text-slate-800">
              {{ TASK_STATUS_META[col].label }}
            </h2>
          </div>
          <UBadge color="neutral" variant="subtle" size="xs">
            {{ tasksInColumn(col).length }}
          </UBadge>
        </div>

        <div class="flex-1 space-y-2.5">
          <div
            v-for="task in tasksInColumn(col)"
            :key="task.id"
            draggable="true"
            class="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition hover:border-indigo-300 active:cursor-grabbing"
            @dragstart="onDragStart(task.id)"
            @click="openEditTask(task)"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-slate-900">{{ task.title }}</p>
              <UBadge
                :color="TASK_PRIORITY_META[task.priority].color"
                variant="subtle"
                size="xs"
                class="shrink-0"
              >
                {{ TASK_PRIORITY_META[task.priority].label }}
              </UBadge>
            </div>

            <p v-if="task.projectName" class="mt-1 text-xs text-slate-500">
              {{ task.projectName }}
            </p>

            <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span
                :class="
                  isOverdue(task.dueDate, task.status)
                    ? 'font-semibold text-rose-600'
                    : 'text-slate-500'
                "
              >
                {{ task.dueDate ? formatDateTimeId(task.dueDate) : 'Tanpa deadline' }}
              </span>
              <UAvatar
                v-if="task.assigneeName"
                :alt="task.assigneeName"
                size="2xs"
                :title="task.assigneeName"
              />
            </div>
          </div>

          <div
            v-if="tasksInColumn(col).length === 0"
            class="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500"
          >
            Kosong: seret tugas ke sini
          </div>
        </div>
      </div>
    </div>

    <TaskDetailModal
      v-if="activeWorkspace"
      v-model:open="modalOpen"
      :workspace-id="activeWorkspace.id"
      :task="selectedTask"
      :projects="projects"
      :members="members"
      :default-project-id="selectedProjectId !== 'all' ? selectedProjectId : undefined"
      @saved="loadBoard"
      @deleted="loadBoard"
    />
  </div>
</template>
