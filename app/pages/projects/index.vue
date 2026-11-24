<script setup lang="ts">
import {
  PROJECT_STATUS_META,
  formatDateId,
  toInputDate
} from '~/composables/useFormatters'
import type { ProjectStatus } from '../../../shared/types/domain'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const toast = useToast()
const { activeWorkspace, canManageProjects } = useTaskoraSession()

interface ProjectRow {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  startDate: string | null
  dueDate: string | null
  totalTasks: number
  completedTasks: number
  progress: number
  members: Array<{ userId: string; name: string }>
}

const loading = ref(true)
const errorMsg = ref('')
const projects = ref<ProjectRow[]>([])

const modalOpen = ref(false)
const editingProject = ref<ProjectRow | null>(null)
const saving = ref(false)

const deleteTarget = ref<ProjectRow | null>(null)
const deleteOpen = computed({
  get: () => Boolean(deleteTarget.value),
  set: (val: boolean) => {
    if (!val) deleteTarget.value = null
  }
})
const deleting = ref(false)

const form = reactive({
  name: '',
  description: '',
  status: 'active' as ProjectStatus,
  startDate: '',
  dueDate: ''
})

async function loadProjects() {
  if (!activeWorkspace.value) {
    loading.value = false
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch<{ projects: ProjectRow[] }>(
      `/api/workspaces/${activeWorkspace.value.id}/projects`
    )
    projects.value = res.projects || []
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal memuat proyek.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingProject.value = null
  form.name = ''
  form.description = ''
  form.status = 'active'
  form.startDate = ''
  form.dueDate = ''
  modalOpen.value = true
}

function openEdit(project: ProjectRow) {
  editingProject.value = project
  form.name = project.name
  form.description = project.description || ''
  form.status = project.status
  form.startDate = toInputDate(project.startDate)
  form.dueDate = toInputDate(project.dueDate)
  modalOpen.value = true
}

async function handleSave() {
  if (!activeWorkspace.value || !form.name.trim()) return
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      status: form.status,
      startDate: form.startDate || null,
      dueDate: form.dueDate || null
    }

    if (editingProject.value) {
      await $fetch(
        `/api/workspaces/${activeWorkspace.value.id}/projects/${editingProject.value.id}`,
        { method: 'PATCH', body: payload }
      )
      toast.add({ title: 'Proyek berhasil diperbarui', color: 'success' })
    } else {
      await $fetch(`/api/workspaces/${activeWorkspace.value.id}/projects`, {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Proyek baru berhasil dibuat', color: 'success' })
    }

    modalOpen.value = false
    await loadProjects()
  } catch (err: any) {
    toast.add({
      title: 'Gagal menyimpan proyek',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!activeWorkspace.value || !deleteTarget.value || deleting.value) return
  deleting.value = true
  try {
    await $fetch(
      `/api/workspaces/${activeWorkspace.value.id}/projects/${deleteTarget.value.id}`,
      { method: 'DELETE' }
    )
    toast.add({ title: 'Proyek dihapus', color: 'success' })
    deleteTarget.value = null
    await loadProjects()
  } catch (err: any) {
    toast.add({
      title: 'Gagal menghapus proyek',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}

watch(
  () => activeWorkspace.value?.id,
  () => {
    loadProjects()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Kelola seluruh proyek, deadline, anggota, dan progres di workspace ini.
        </p>
      </div>
      <UButton
        v-if="canManageProjects"
        color="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Proyek Baru
      </UButton>
    </div>

    <UAlert
      v-if="errorMsg"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      :title="errorMsg"
    >
      <template #actions>
        <UButton size="xs" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadProjects">
          Coba lagi
        </UButton>
      </template>
    </UAlert>

    <div v-else-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 3" :key="i" class="h-44 rounded-xl" />
    </div>

    <UCard v-else-if="projects.length === 0">
      <div class="py-12 text-center">
        <UIcon name="i-lucide-folder-kanban" class="mx-auto h-10 w-10 text-slate-300" />
        <p class="mt-3 text-sm font-medium text-slate-900">Belum ada proyek</p>
        <p class="mt-1 text-xs text-slate-500">
          Buat proyek pertama untuk mulai mengorganisir tugas tim Anda.
        </p>
        <UButton
          v-if="canManageProjects"
          class="mt-4"
          color="primary"
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Buat Proyek Pertama
        </UButton>
      </div>
    </UCard>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="p in projects" :key="p.id" class="flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <NuxtLink
              :to="`/projects/${p.id}`"
              class="text-base font-semibold text-slate-900 hover:text-indigo-600"
            >
              {{ p.name }}
            </NuxtLink>
            <UBadge :color="PROJECT_STATUS_META[p.status].color" variant="subtle" size="xs">
              {{ PROJECT_STATUS_META[p.status].label }}
            </UBadge>
          </div>

          <p class="line-clamp-2 text-xs text-slate-500">
            {{ p.description || 'Tidak ada deskripsi proyek.' }}
          </p>

          <!-- Progress -->
          <div class="space-y-1.5 pt-1">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Progres ({{ p.completedTasks }}/{{ p.totalTasks }} tugas)</span>
              <span class="font-semibold text-slate-900">{{ p.progress }}%</span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-indigo-600 transition-all"
                :style="{ width: `${p.progress}%` }"
              />
            </div>
          </div>
        </div>

        <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div class="flex items-center gap-1.5">
            <UIcon name="i-lucide-calendar" class="h-3.5 w-3.5" />
            <span>{{ formatDateId(p.dueDate) }}</span>
          </div>

          <div class="flex items-center gap-1">
            <UButton
              :to="`/projects/${p.id}`"
              size="xs"
              color="neutral"
              variant="ghost"
            >
              Buka
            </UButton>
            <UButton
              v-if="canManageProjects"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              @click="openEdit(p)"
            />
            <UButton
              v-if="canManageProjects"
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              aria-label="Hapus proyek"
              @click="deleteTarget = p"
            />
          </div>
        </div>
      </UCard>
    </div>

    <AppModal
      :open="modalOpen"
      :title="editingProject ? 'Edit Proyek' : 'Buat Proyek Baru'"
      @update:open="(val) => (modalOpen = val)"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="handleSave">
          <UFormField label="Nama Proyek" required>
            <UInput v-model="form.name" placeholder="Mis. Redesign Website Klien" class="w-full" required />
          </UFormField>

          <UFormField label="Deskripsi">
            <UTextarea
              v-model="form.description"
              placeholder="Tujuan dan ruang lingkup proyek..."
              class="w-full"
            />
          </UFormField>

          <UFormField label="Status Proyek">
            <USelect
              v-model="form.status"
              :items="
                Object.entries(PROJECT_STATUS_META).map(([value, m]) => ({
                  label: m.label,
                  value
                }))
              "
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Tanggal Mulai">
              <UInput v-model="form.startDate" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Deadline">
              <UInput v-model="form.dueDate" type="date" class="w-full" />
            </UFormField>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton type="button" color="neutral" variant="ghost" @click="modalOpen = false">
              Batal
            </UButton>
            <UButton type="submit" color="primary" :loading="saving">
              Simpan Proyek
            </UButton>
          </div>
        </form>
      </template>
    </AppModal>

    <!-- Modal Konfirmasi Hapus Proyek -->
    <AppModal
      :open="deleteOpen"
      title="Hapus proyek ini?"
      max-width="md"
      @update:open="(val) => (deleteOpen = val)"
    >
      <template #body>
        <p class="text-sm text-slate-600">
          Proyek
          <span class="font-semibold text-slate-900">"{{ deleteTarget?.name }}"</span>
          beserta seluruh tugas di dalamnya akan dihapus permanen. Tindakan ini tidak dapat
          dibatalkan.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton type="button" color="neutral" variant="ghost" :disabled="deleting" @click="deleteOpen = false">
            Batal
          </UButton>
          <UButton color="error" icon="i-lucide-trash-2" :loading="deleting" @click="handleDelete">
            Ya, Hapus Proyek
          </UButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
