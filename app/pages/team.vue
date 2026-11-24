<script setup lang="ts">
import { WORKSPACE_ROLES, type WorkspaceRole } from '#shared/types/domain'
import { ROLE_META, TASK_STATUS_META } from '~/composables/useFormatters'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const toast = useToast()
const { user, activeWorkspace, isOwner } = useTaskoraSession()

interface TeamMemberRow {
  memberId: string
  userId: string
  name: string
  email: string
  role: WorkspaceRole
  taskCount: number
  completedTaskCount: number
  tasks: Array<{
    id: string
    title: string
    status: keyof typeof TASK_STATUS_META
  }>
}

const loading = ref(true)
const errorMsg = ref('')
const members = ref<TeamMemberRow[]>([])

const inviteOpen = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<WorkspaceRole>('member')
const inviting = ref(false)
const selectedMemberTasks = ref<TeamMemberRow | null>(null)
const memberTasksOpen = computed({
  get: () => Boolean(selectedMemberTasks.value),
  set: (val: boolean) => {
    if (!val) selectedMemberTasks.value = null
  }
})

const removeTarget = ref<TeamMemberRow | null>(null)
const removeOpen = computed({
  get: () => Boolean(removeTarget.value),
  set: (val: boolean) => {
    if (!val) removeTarget.value = null
  }
})
const removing = ref(false)

async function loadTeam() {
  if (!activeWorkspace.value) {
    loading.value = false
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch<{ members: TeamMemberRow[] }>(
      `/api/workspaces/${activeWorkspace.value.id}/members`
    )
    members.value = res.members || []
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal memuat anggota tim.'
  } finally {
    loading.value = false
  }
}

async function handleInvite() {
  if (!activeWorkspace.value || !inviteEmail.value.trim()) return
  inviting.value = true
  try {
    await $fetch(`/api/workspaces/${activeWorkspace.value.id}/members`, {
      method: 'POST',
      body: {
        email: inviteEmail.value.trim(),
        role: inviteRole.value
      }
    })
    inviteOpen.value = false
    inviteEmail.value = ''
    inviteRole.value = 'member'
    toast.add({ title: 'Anggota berhasil ditambahkan', color: 'success' })
    await loadTeam()
  } catch (err: any) {
    toast.add({
      title: 'Gagal mengundang anggota',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    inviting.value = false
  }
}

const savingRoleMemberId = ref<string | null>(null)
const hasOwner = computed(() => members.value.some((m) => m.role === 'owner'))
const availableInviteRoles = computed(() =>
  WORKSPACE_ROLES.filter((r) => !(hasOwner.value && r === 'owner')).map((r) => ({
    label: ROLE_META[r].label,
    value: r
  }))
)

async function handleRoleChange(member: TeamMemberRow, newRole: WorkspaceRole) {
  if (!activeWorkspace.value || newRole === member.role) return
  savingRoleMemberId.value = member.memberId
  try {
    await $fetch(`/api/workspaces/${activeWorkspace.value.id}/members/${member.memberId}`, {
      method: 'PATCH',
      body: { role: newRole }
    })
    member.role = newRole
    toast.add({ title: 'Role anggota diperbarui', color: 'success' })
  } catch (err: any) {
    toast.add({
      title: 'Gagal mengubah role',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    savingRoleMemberId.value = null
  }
}

async function handleRemove() {
  if (!activeWorkspace.value || !removeTarget.value || removing.value) return
  removing.value = true
  try {
    await $fetch(
      `/api/workspaces/${activeWorkspace.value.id}/members/${removeTarget.value.memberId}`,
      { method: 'DELETE' }
    )
    toast.add({ title: 'Anggota dihapus dari workspace', color: 'success' })
    removeTarget.value = null
    await loadTeam()
  } catch (err: any) {
    toast.add({
      title: 'Gagal menghapus anggota',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    removing.value = false
  }
}

watch(
  () => activeWorkspace.value?.id,
  () => {
    loadTeam()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Team</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Kelola anggota workspace, atur peran, dan pantau beban tugas setiap anggota.
        </p>
      </div>
      <UButton
        v-if="isOwner"
        color="primary"
        icon="i-lucide-user-plus"
        @click="inviteOpen = true"
      >
        Undang Anggota
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
        <UButton size="xs" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadTeam">
          Coba lagi
        </UButton>
      </template>
    </UAlert>

    <USkeleton v-else-if="loading" class="h-64 rounded-xl" />

    <UCard v-else :ui="{ body: 'p-0' }">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3">Anggota</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Tugas</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="m in members" :key="m.memberId">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <UAvatar :alt="m.name" size="sm" />
                  <div>
                    <p class="font-semibold text-slate-900">{{ m.name }}</p>
                    <p class="text-xs text-slate-500">{{ m.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <InlineConfirmSelect
                  v-if="isOwner && m.userId !== user?.id && !hasOwner"
                  :model-value="m.role"
                  :items="WORKSPACE_ROLES.map((r) => ({ label: ROLE_META[r].label, value: r }))"
                  :saving="savingRoleMemberId === m.memberId"
                  select-class="w-28"
                  confirm-label="Simpan perubahan role"
                  @confirm="(val) => handleRoleChange(m, val as WorkspaceRole)"
                />
                <UBadge v-else :color="ROLE_META[m.role].color" variant="subtle" size="xs">
                  {{ ROLE_META[m.role].label }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-xs text-slate-600">
                {{ m.completedTaskCount }}/{{ m.taskCount }} selesai
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-1">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    @click="selectedMemberTasks = m"
                  >
                    Lihat Tugas
                  </UButton>
                  <UButton
                    v-if="isOwner && m.userId !== user?.id"
                    size="xs"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    :aria-label="`Hapus ${m.name}`"
                    @click="removeTarget = m"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Modal Undang Anggota -->
    <AppModal
      :open="inviteOpen"
      title="Undang Anggota ke Workspace"
      max-width="md"
      @update:open="(val) => (inviteOpen = val)"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="handleInvite">
          <UFormField label="Email Pengguna" required>
            <UInput
              v-model="inviteEmail"
              type="email"
              placeholder="anggota@tim.com"
              class="w-full"
              required
            />
          </UFormField>
          <UFormField
            label="Role"
            :hint="hasOwner ? 'Workspace hanya dapat memiliki 1 Owner' : undefined"
          >
            <USelect
              v-model="inviteRole"
              :items="availableInviteRoles"
              :disabled="hasOwner"
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton type="button" color="neutral" variant="ghost" @click="inviteOpen = false">
              Batal
            </UButton>
            <UButton type="submit" color="primary" :loading="inviting">
              Tambahkan
            </UButton>
          </div>
        </form>
      </template>
    </AppModal>

    <!-- Modal Tugas Anggota -->
    <AppModal
      :open="memberTasksOpen"
      :title="`Daftar Tugas: ${selectedMemberTasks?.name || ''}`"
      @update:open="(val) => (memberTasksOpen = val)"
    >
      <template #body>
        <div v-if="selectedMemberTasks">
          <div
            v-if="selectedMemberTasks.tasks.length === 0"
            class="py-6 text-center text-sm text-slate-500"
          >
            Belum ada tugas yang ditugaskan kepada anggota ini.
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="t in selectedMemberTasks.tasks"
              :key="t.id"
              class="flex items-center justify-between py-2.5"
            >
              <span class="text-sm font-medium text-slate-900">{{ t.title }}</span>
              <UBadge :color="TASK_STATUS_META[t.status].color" variant="subtle" size="xs">
                {{ TASK_STATUS_META[t.status].label }}
              </UBadge>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end">
          <UButton type="button" color="neutral" variant="outline" @click="memberTasksOpen = false">
            Tutup
          </UButton>
        </div>
      </template>
    </AppModal>

    <!-- Modal Konfirmasi Hapus Anggota -->
    <AppModal
      :open="removeOpen"
      title="Hapus anggota dari workspace?"
      max-width="md"
      @update:open="(val) => (removeOpen = val)"
    >
      <template #body>
        <p class="text-sm text-slate-600">
          <span class="font-semibold text-slate-900">{{ removeTarget?.name }}</span>
          ({{ removeTarget?.email }}) akan dihapus dari workspace ini dan kehilangan akses ke
          seluruh proyek di dalamnya. Tugas yang ditugaskan kepadanya tidak ikut terhapus.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton type="button" color="neutral" variant="ghost" :disabled="removing" @click="removeOpen = false">
            Batal
          </UButton>
          <UButton color="error" icon="i-lucide-trash-2" :loading="removing" @click="handleRemove">
            Ya, Hapus Anggota
          </UButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
