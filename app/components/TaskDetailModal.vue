<script setup lang="ts">
import type { TaskPriority, TaskStatus } from '../../shared/types/domain'
import { TASK_PRIORITY_META, TASK_STATUS_META, formatDateId, toInputDateTime } from '~/composables/useFormatters'

export interface TaskItem {
  id: string
  projectId: string
  projectName?: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  assigneeName?: string | null
  dueDate: string | Date | null
  proofUrl?: string | null
  proofImage?: string | null
}

export interface SimpleMember {
  userId: string
  name: string
}

export interface SimpleProject {
  id: string
  name: string
  members?: SimpleMember[]
}

const props = defineProps<{
  open: boolean
  workspaceId: string
  task: TaskItem | null
  projects: SimpleProject[]
  members: SimpleMember[]
  defaultProjectId?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
  deleted: []
}>()

const toast = useToast()
const { isOwner, user } = useTaskoraSession()
const UNASSIGNED_VALUE = '__unassigned__'

const isOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit('update:open', val)
})

const form = reactive({
  projectId: '',
  title: '',
  description: '',
  status: 'todo' as TaskStatus,
  priority: 'medium' as TaskPriority,
  assigneeId: UNASSIGNED_VALUE as string,
  dueDate: '',
  proofUrl: '',
  proofImage: ''
})

const saving = ref(false)
const deleting = ref(false)
const confirmingDelete = ref(false)
const previewProofOpen = ref(false)
const previewProofSrc = computed(() => (previewProofOpen.value ? form.proofImage : null))
const comments = ref<
  Array<{
    id: string
    authorName: string
    content: string
    createdAt: string
  }>
>([])
const loadingComments = ref(false)
const newComment = ref('')
const sendingComment = ref(false)

const availableAssignees = computed<SimpleMember[]>(() => {
  const selectedProj = props.projects.find((p) => p.id === form.projectId)
  if (selectedProj?.members) {
    return selectedProj.members
  }
  return props.members
})

watch(
  () => form.projectId,
  () => {
    if (!props.open) return
    if (
      form.assigneeId !== UNASSIGNED_VALUE &&
      !availableAssignees.value.some((m) => m.userId === form.assigneeId)
    ) {
      form.assigneeId = UNASSIGNED_VALUE
    }
  }
)

watch(
  () => [props.open, props.task, props.defaultProjectId],
  async () => {
    confirmingDelete.value = false
    if (!props.open) return
    if (props.task) {
      form.projectId = props.task.projectId
      form.title = props.task.title
      form.description = props.task.description || ''
      form.status = props.task.status
      form.priority = props.task.priority
      form.assigneeId = props.task.assigneeId || UNASSIGNED_VALUE
      form.dueDate = toInputDateTime(props.task.dueDate)
      form.proofUrl = props.task.proofUrl || ''
      form.proofImage = props.task.proofImage || ''
      await loadComments(props.task.id)
    } else {
      form.projectId = props.defaultProjectId || props.projects[0]?.id || ''
      form.title = ''
      form.description = ''
      form.status = 'todo'
      form.priority = 'medium'
      form.assigneeId = isOwner.value
        ? UNASSIGNED_VALUE
        : user.value?.id || UNASSIGNED_VALUE
      form.dueDate = ''
      form.proofUrl = ''
      form.proofImage = ''
      comments.value = []
    }
  },
  { immediate: true }
)

async function loadComments(taskId: string) {
  loadingComments.value = true
  try {
    const res = await $fetch<{ comments: typeof comments.value }>(
      `/api/workspaces/${props.workspaceId}/tasks/${taskId}/comments`
    )
    comments.value = res.comments || []
  } catch {
    comments.value = []
  } finally {
    loadingComments.value = false
  }
}

function onProofImageSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'File harus berupa gambar (PNG/JPG/WebP)', color: 'error' })
    input.value = ''
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: 'Ukuran foto maksimal 2MB', color: 'error' })
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.proofImage = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsDataURL(file)
}

async function handleSave() {
  if (!form.title.trim() || !form.projectId) return
  saving.value = true
  try {
    const payload =
      props.task && !isOwner.value
        ? {
            status: form.status,
            proofUrl: form.proofUrl.trim() || null,
            proofImage: form.proofImage || null
          }
        : {
            projectId: form.projectId,
            title: form.title.trim(),
            description: form.description.trim() || null,
            status: form.status,
            priority: form.priority,
            ...(isOwner.value || !props.task
              ? {
                  assigneeId:
                    form.assigneeId === UNASSIGNED_VALUE ? null : form.assigneeId || null
                }
              : {}),
            dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
            proofUrl: form.proofUrl.trim() || null,
            proofImage: form.proofImage || null
          }

    if (props.task) {
      await $fetch(`/api/workspaces/${props.workspaceId}/tasks/${props.task.id}`, {
        method: 'PATCH',
        body: payload
      })
      toast.add({ title: 'Tugas berhasil diperbarui', color: 'success' })
    } else {
      await $fetch(`/api/workspaces/${props.workspaceId}/tasks`, {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Tugas baru berhasil dibuat', color: 'success' })
    }
    emit('update:open', false)
    emit('saved')
  } catch (err: any) {
    toast.add({
      title: 'Gagal menyimpan tugas',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!props.task) return
  deleting.value = true
  try {
    await $fetch(`/api/workspaces/${props.workspaceId}/tasks/${props.task.id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Tugas dihapus', color: 'success' })
    emit('update:open', false)
    emit('deleted')
  } catch (err: any) {
    toast.add({
      title: 'Gagal menghapus tugas',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}

async function handleAddComment() {
  if (!props.task || !newComment.value.trim()) return
  sendingComment.value = true
  try {
    const res = await $fetch<{ comment: (typeof comments.value)[number] }>(
      `/api/workspaces/${props.workspaceId}/tasks/${props.task.id}/comments`,
      {
        method: 'POST',
        body: { content: newComment.value.trim() }
      }
    )
    comments.value.push(res.comment)
    newComment.value = ''
  } catch (err: any) {
    toast.add({
      title: 'Gagal mengirim komentar',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    sendingComment.value = false
  }
}
</script>

<template>
  <AppModal
    :open="open"
    :title="task ? 'Detail & Edit Tugas' : 'Buat Tugas Baru'"
    max-width="xl"
    @update:open="(val) => emit('update:open', val)"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="handleSave">
        <UFormField v-if="!task" label="Proyek" required>
          <USelect
            v-model="form.projectId"
            :items="projects.map((p) => ({ label: p.name, value: p.id }))"
            placeholder="Pilih proyek"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Judul Tugas" required>
          <UInput
            v-model="form.title"
            placeholder="Mis. Desain wireframe dashboard"
            :disabled="Boolean(task && !isOwner)"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Deskripsi">
          <UTextarea
            v-model="form.description"
            placeholder="Detail pekerjaan, kriteria selesai, atau tautan referensi..."
            :disabled="Boolean(task && !isOwner)"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField label="Status">
            <USelect
              v-model="form.status"
              :items="
                Object.entries(TASK_STATUS_META).map(([value, meta]) => ({
                  label: meta.label,
                  value
                }))
              "
              class="w-full"
            />
          </UFormField>

          <UFormField label="Prioritas">
            <USelect
              v-model="form.priority"
              :disabled="Boolean(task && !isOwner)"
              :items="
                Object.entries(TASK_PRIORITY_META).map(([value, meta]) => ({
                  label: meta.label,
                  value
                }))
              "
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField
            label="Penanggung Jawab"
            :hint="!isOwner ? 'Hanya Owner yang dapat membagikan tugas' : undefined"
          >
            <USelectMenu
              v-model="form.assigneeId"
              value-key="value"
              :disabled="!isOwner"
              :search-input="{ placeholder: 'Ketik nama penanggung jawab...' }"
              :items="[
                { label: 'Belum ditugaskan', value: UNASSIGNED_VALUE },
                ...availableAssignees.map((m) => ({ label: m.name, value: m.userId }))
              ]"
              placeholder="Pilih atau ketik penanggung jawab..."
              class="w-full"
            />
          </UFormField>

          <UFormField label="Deadline (Tanggal & Jam)">
            <UInput v-model="form.dueDate" type="datetime-local" :disabled="Boolean(task && !isOwner)" class="w-full" />
          </UFormField>
        </div>

        <!-- Bukti Penyelesaian -->
        <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Bukti Penyelesaian (Link / Foto)
            </span>
            <UBadge
              v-if="form.proofUrl || form.proofImage"
              color="success"
              variant="subtle"
              size="xs"
            >
              Terlampir
            </UBadge>
          </div>

          <UFormField label="Link Bukti (Google Drive, Figma, GitHub, dll.)">
            <div class="flex gap-2">
              <UInput
                v-model="form.proofUrl"
                type="url"
                placeholder="https://drive.google.com/..."
                icon="i-lucide-link"
                class="flex-1"
              />
              <UButton
                v-if="form.proofUrl"
                :to="form.proofUrl"
                target="_blank"
                color="neutral"
                variant="outline"
                icon="i-lucide-external-link"
                title="Buka link bukti"
              />
              <UButton
                v-if="form.proofUrl"
                type="button"
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                title="Hapus link bukti"
                @click="form.proofUrl = ''"
              />
            </div>
          </UFormField>

          <UFormField label="Foto / Screenshot Bukti (Maks. 2MB)">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50">
                  <UIcon name="i-lucide-image-plus" class="h-4 w-4 text-indigo-600" />
                  <span>{{ form.proofImage ? 'Ganti Foto' : 'Pilih Foto Bukti' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onProofImageSelected"
                  >
                </label>

                <UButton
                  v-if="form.proofImage"
                  type="button"
                  size="xs"
                  color="primary"
                  variant="soft"
                  icon="i-lucide-maximize-2"
                  @click="previewProofOpen = true"
                >
                  Buka Foto
                </UButton>

                <UButton
                  v-if="form.proofImage"
                  type="button"
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-x"
                  @click="form.proofImage = ''"
                >
                  Hapus Foto
                </UButton>
              </div>

              <div v-if="form.proofImage" class="overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5">
                <button
                  type="button"
                  class="block w-full cursor-zoom-in"
                  title="Klik untuk memperbesar foto"
                  @click="previewProofOpen = true"
                >
                  <img
                    :src="form.proofImage"
                    alt="Preview bukti penyelesaian"
                    class="max-h-44 w-full rounded object-contain"
                  >
                </button>
              </div>
            </div>
          </UFormField>
        </div>

        <div class="flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <UButton
            v-if="task && isOwner"
            type="button"
            :color="confirmingDelete ? 'error' : 'neutral'"
            :variant="confirmingDelete ? 'soft' : 'ghost'"
            :icon="confirmingDelete ? 'i-lucide-alert-triangle' : 'i-lucide-trash-2'"
            :loading="deleting"
            @click="confirmingDelete ? handleDelete() : (confirmingDelete = true)"
          >
            {{ confirmingDelete ? 'Ya, hapus tugas ini?' : 'Hapus' }}
          </UButton>
          <div v-else />

          <div class="flex gap-2">
            <UButton type="button" color="neutral" variant="ghost" @click="isOpen = false">
              Batal
            </UButton>
            <UButton type="submit" color="primary" :loading="saving">
              {{ task ? 'Simpan Perubahan' : 'Buat Tugas' }}
            </UButton>
          </div>
        </div>
      </form>

      <!-- Komentar Tugas -->
      <div v-if="task" class="mt-6 border-t border-slate-200 pt-4">
        <h4 class="mb-3 text-sm font-semibold text-slate-900">
          Komentar ({{ comments.length }})
        </h4>

        <div v-if="loadingComments" class="text-xs text-slate-500">Memuat komentar...</div>
        <div v-else-if="comments.length === 0" class="mb-3 text-xs text-slate-500">
          Belum ada komentar pada tugas ini.
        </div>
        <div v-else class="mb-3 max-h-44 space-y-2.5 overflow-y-auto">
          <div
            v-for="c in comments"
            :key="c.id"
            class="rounded-lg border border-slate-100 bg-slate-50 p-2.5"
          >
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-900">{{ c.authorName }}</span>
              <span class="text-slate-500">{{ formatDateId(c.createdAt) }}</span>
            </div>
            <p class="mt-1 text-xs text-slate-700">{{ c.content }}</p>
          </div>
        </div>

        <form class="flex gap-2" @submit.prevent="handleAddComment">
          <UInput
            v-model="newComment"
            placeholder="Tulis komentar..."
            class="flex-1"
            size="sm"
          />
          <UButton type="submit" size="sm" color="primary" :loading="sendingComment">
            Kirim
          </UButton>
        </form>
      </div>
    </template>
  </AppModal>

  <ProofImageModal
    :src="previewProofSrc"
    title="Bukti Foto Tugas"
    @close="previewProofOpen = false"
  />
</template>
