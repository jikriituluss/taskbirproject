<script setup lang="ts">
import {
  PROJECT_STATUS_META,
  TASK_PRIORITY_META,
  TASK_STATUS_META,
  formatDateId,
  formatDateTimeId,
  isOverdue
} from '~/composables/useFormatters'
import type { ProjectStatus, TaskPriority, TaskStatus } from '../../../shared/types/domain'
import type { SimpleMember, TaskItem } from '~/components/TaskDetailModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const toast = useToast()
const { activeWorkspace, canManageProjects } = useTaskoraSession()

interface ProjectTaskItem extends TaskItem {
  assigneeName?: string | null
}

interface ProjectDetail {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  startDate: string | null
  dueDate: string | null
  totalTasks: number
  completedTasks: number
  progress: number
  members: Array<{ userId: string; name: string; email: string }>
  tasks: ProjectTaskItem[]
}

const projectId = computed(() => String(route.params.id))
const loading = ref(true)
const errorMsg = ref('')
const project = ref<ProjectDetail | null>(null)
const workspaceMembers = ref<SimpleMember[]>([])

const selectedMemberToAdd = ref('')
const addingMember = ref(false)
const taskModalOpen = ref(false)
const selectedTask = ref<TaskItem | null>(null)
const memberFilter = ref('all')
const previewImage = ref<string | null>(null)

async function loadProject() {
  if (!activeWorkspace.value) {
    loading.value = false
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const wsId = activeWorkspace.value.id
    const [projRes, memRes] = await Promise.all([
      $fetch<{ project: ProjectDetail }>(`/api/workspaces/${wsId}/projects/${projectId.value}`),
      $fetch<{ members: SimpleMember[] }>(`/api/workspaces/${wsId}/members`)
    ])
    project.value = projRes.project
    workspaceMembers.value = memRes.members || []
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal memuat detail proyek.'
  } finally {
    loading.value = false
  }
}

const availableMembersToAdd = computed(() => {
  if (!project.value) return []
  const currentIds = new Set(project.value.members.map((m) => m.userId))
  return workspaceMembers.value.filter((m) => !currentIds.has(m.userId))
})

const filteredTasks = computed(() => {
  if (!project.value) return []
  if (memberFilter.value === 'all') return project.value.tasks
  if (memberFilter.value === '__unassigned__') {
    return project.value.tasks.filter((t) => !t.assigneeId)
  }
  return project.value.tasks.filter((t) => t.assigneeId === memberFilter.value)
})

function getMemberName(task: ProjectTaskItem): string {
  if (task.assigneeName) return task.assigneeName
  if (!task.assigneeId) return 'Belum ditugaskan'
  return workspaceMembers.value.find((m) => m.userId === task.assigneeId)?.name || 'Anggota'
}

function getMemberProgress(userId: string) {
  const memberTasks = project.value?.tasks.filter((t) => t.assigneeId === userId) || []
  const done = memberTasks.filter((t) => t.status === 'done').length
  const total = memberTasks.length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  return { total, done, percent }
}

async function handleAddMember() {
  if (!activeWorkspace.value || !selectedMemberToAdd.value) return
  addingMember.value = true
  try {
    await $fetch(
      `/api/workspaces/${activeWorkspace.value.id}/projects/${projectId.value}/members`,
      {
        method: 'POST',
        body: { userId: selectedMemberToAdd.value }
      }
    )
    selectedMemberToAdd.value = ''
    toast.add({ title: 'Anggota ditambahkan ke proyek', color: 'success' })
    await loadProject()
  } catch (err: any) {
    toast.add({
      title: 'Gagal menambah anggota',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    addingMember.value = false
  }
}

async function handleRemoveMember(userId: string) {
  if (!activeWorkspace.value) return
  try {
    await $fetch(
      `/api/workspaces/${activeWorkspace.value.id}/projects/${projectId.value}/members`,
      {
        method: 'DELETE',
        body: { userId }
      }
    )
    toast.add({ title: 'Anggota dihapus dari proyek', color: 'success' })
    await loadProject()
  } catch (err: any) {
    toast.add({
      title: 'Gagal menghapus anggota',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  }
}

function openCreateTask() {
  selectedTask.value = null
  taskModalOpen.value = true
}

function openEditTask(t: TaskItem) {
  selectedTask.value = t
  taskModalOpen.value = true
}

watch(
  () => [activeWorkspace.value?.id, projectId.value],
  () => {
    loadProject()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/projects" class="hover:text-indigo-600">Projects</NuxtLink>
      <span>/</span>
      <span class="font-medium text-slate-900">{{ project?.name || 'Detail Proyek' }}</span>
    </div>

    <UAlert
      v-if="errorMsg"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      :title="errorMsg"
    >
      <template #actions>
        <UButton size="xs" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadProject">
          Coba lagi
        </UButton>
      </template>
    </UAlert>

    <div v-else-if="loading" class="space-y-4">
      <USkeleton class="h-32 rounded-xl" />
      <USkeleton class="h-64 rounded-xl" />
    </div>

    <template v-else-if="project">
      <!-- Project Header Card -->
      <div class="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/75 via-white to-amber-50/50 p-6 shadow-xs">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2.5">
              <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ project.name }}</h1>
              <UBadge :color="PROJECT_STATUS_META[project.status].color" variant="subtle">
                {{ PROJECT_STATUS_META[project.status].label }}
              </UBadge>
            </div>
            <p class="max-w-2xl text-sm text-slate-600">
              {{ project.description || 'Tidak ada deskripsi proyek.' }}
            </p>
            <div class="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
              <span>Mulai: {{ formatDateId(project.startDate) }}</span>
              <span>Deadline: {{ formatDateId(project.dueDate) }}</span>
              <span>Progres: {{ project.completedTasks }}/{{ project.totalTasks }} tugas ({{ project.progress }}%)</span>
            </div>
          </div>

          <div class="flex gap-2">
            <UButton color="primary" icon="i-lucide-plus" @click="openCreateTask">
              Tambah Tugas
            </UButton>
            <UButton to="/kanban" color="neutral" variant="outline" icon="i-lucide-columns-3">
              Kanban
            </UButton>
          </div>
        </div>

        <div class="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
          <div
            class="h-full rounded-full bg-indigo-600 transition-all"
            :style="{ width: `${project.progress}%` }"
          />
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Tasks Table -->
        <div class="lg:col-span-2">
          <UCard class="overflow-hidden rounded-2xl border-slate-200/90 shadow-xs" :ui="{ body: 'p-0' }">
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="text-base font-semibold text-slate-900">
                  Daftar Tugas ({{ filteredTasks.length }})
                </h2>
                <USelect
                  v-model="memberFilter"
                  :items="[
                    { label: 'Semua Anggota', value: 'all' },
                    { label: 'Belum ditugaskan', value: '__unassigned__' },
                    ...workspaceMembers.map((m) => ({ label: m.name, value: m.userId }))
                  ]"
                  size="xs"
                  class="w-48"
                />
              </div>
            </template>

            <div v-if="filteredTasks.length === 0" class="p-8 text-center text-sm text-slate-500">
              Belum ada tugas yang sesuai filter di proyek ini.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200 text-sm">
                <thead class="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th class="px-4 py-2.5">Judul</th>
                    <th class="px-4 py-2.5">Penanggung Jawab</th>
                    <th class="px-4 py-2.5">Status</th>
                    <th class="px-4 py-2.5">Prioritas</th>
                    <th class="px-4 py-2.5">Bukti Kerja</th>
                    <th class="px-4 py-2.5">Deadline</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="t in filteredTasks" :key="t.id" class="hover:bg-slate-50/70">
                    <td class="px-4 py-2.5 font-medium text-slate-900">
                      <button type="button" class="text-left hover:text-indigo-600" @click="openEditTask(t)">
                        {{ t.title }}
                      </button>
                    </td>
                    <td class="px-4 py-2.5">
                      <div v-if="t.assigneeId" class="flex items-center gap-2">
                        <UAvatar :alt="getMemberName(t)" size="2xs" />
                        <span class="text-xs font-medium text-slate-700">{{ getMemberName(t) }}</span>
                      </div>
                      <span v-else class="text-xs text-slate-500">Belum ditugaskan</span>
                    </td>
                    <td class="px-4 py-2.5">
                      <UBadge :color="TASK_STATUS_META[t.status as TaskStatus].color" variant="subtle" size="xs">
                        {{ TASK_STATUS_META[t.status as TaskStatus].label }}
                      </UBadge>
                    </td>
                    <td class="px-4 py-2.5">
                      <UBadge :color="TASK_PRIORITY_META[t.priority as TaskPriority].color" variant="subtle" size="xs">
                        {{ TASK_PRIORITY_META[t.priority as TaskPriority].label }}
                      </UBadge>
                    </td>
                    <td class="px-4 py-2.5">
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
                        <span v-if="!t.proofUrl && !t.proofImage" class="text-xs text-slate-500">
                          Belum ada
                        </span>
                      </div>
                    </td>
                    <td
                      class="px-4 py-2.5 text-xs"
                      :class="isOverdue(t.dueDate, t.status) ? 'font-semibold text-rose-600' : 'text-slate-600'"
                    >
                      {{ formatDateTimeId(t.dueDate) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
        </div>

        <!-- Project Members -->
        <div>
          <UCard class="rounded-2xl border-slate-200/90 shadow-xs">
            <template #header>
              <h2 class="text-base font-semibold text-slate-900">
                Anggota Proyek ({{ project.members.length }})
              </h2>
            </template>

            <div class="space-y-3">
              <div
                v-if="canManageProjects && availableMembersToAdd.length > 0"
                class="flex gap-2"
              >
                <USelect
                  v-model="selectedMemberToAdd"
                  :items="availableMembersToAdd.map((m) => ({ label: m.name, value: m.userId }))"
                  placeholder="Pilih anggota..."
                  size="sm"
                  class="flex-1"
                />
                <UButton
                  size="sm"
                  color="primary"
                  :loading="addingMember"
                  @click="handleAddMember"
                >
                  Tambah
                </UButton>
              </div>

              <div class="divide-y divide-slate-100">
                <div
                  v-for="m in project.members"
                  :key="m.userId"
                  class="space-y-1.5 py-2.5"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <UAvatar :alt="m.name" size="xs" />
                      <div>
                        <p class="text-xs font-semibold text-slate-900">{{ m.name }}</p>
                        <p class="text-[11px] text-slate-500">{{ m.email }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-[11px] font-medium text-slate-600">
                        {{ getMemberProgress(m.userId).done }}/{{ getMemberProgress(m.userId).total }} selesai
                      </span>
                      <UButton
                        v-if="canManageProjects"
                        size="xs"
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-x"
                        @click="handleRemoveMember(m.userId)"
                      />
                    </div>
                  </div>
                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      class="h-full rounded-full bg-indigo-500 transition-all"
                      :style="{ width: `${getMemberProgress(m.userId).percent}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>

    <TaskDetailModal
      v-if="activeWorkspace && project"
      v-model:open="taskModalOpen"
      :workspace-id="activeWorkspace.id"
      :task="selectedTask"
      :projects="[{ id: project.id, name: project.name, members: project.members }]"
      :members="project.members"
      :default-project-id="project.id"
      @saved="loadProject"
      @deleted="loadProject"
    />

    <!-- Lightbox Preview Bukti Foto -->
    <ProofImageModal
      :src="previewImage"
      title="Bukti Foto Pekerjaan"
      @close="previewImage = null"
    />
  </div>
</template>
