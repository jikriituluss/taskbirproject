<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const toast = useToast()
const { user, activeWorkspace, isOwner, fetchSession } = useTaskoraSession()

const profileName = ref(user.value?.name || '')
const savingProfile = ref(false)

const wsName = ref(activeWorkspace.value?.name || '')
const wsDesc = ref(activeWorkspace.value?.description || '')
const savingWs = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const savingPassword = ref(false)

watch(
  () => [user.value, activeWorkspace.value],
  () => {
    if (user.value) profileName.value = user.value.name
    if (activeWorkspace.value) {
      wsName.value = activeWorkspace.value.name
      wsDesc.value = activeWorkspace.value.description || ''
    }
  },
  { immediate: true }
)

async function saveProfile() {
  if (!profileName.value.trim()) return
  savingProfile.value = true
  try {
    await $fetch('/api/auth/profile', {
      method: 'PATCH',
      body: { name: profileName.value.trim() }
    })
    await fetchSession(true)
    toast.add({ title: 'Profil berhasil diperbarui', color: 'success' })
  } catch (err: any) {
    toast.add({
      title: 'Gagal memperbarui profil',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    savingProfile.value = false
  }
}

async function saveWorkspace() {
  if (!activeWorkspace.value || !wsName.value.trim()) return
  savingWs.value = true
  try {
    await $fetch(`/api/workspaces/${activeWorkspace.value.id}`, {
      method: 'PATCH',
      body: {
        name: wsName.value.trim(),
        description: wsDesc.value.trim() || null
      }
    })
    await fetchSession(true)
    toast.add({ title: 'Pengaturan workspace disimpan', color: 'success' })
  } catch (err: any) {
    toast.add({
      title: 'Gagal menyimpan workspace',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    savingWs.value = false
  }
}

async function savePassword() {
  savingPassword.value = true
  try {
    await $fetch('/api/auth/password', {
      method: 'PATCH',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
      }
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    toast.add({ title: 'Password berhasil diperbarui', color: 'success' })
  } catch (err: any) {
    toast.add({
      title: 'Gagal mengubah password',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
      <p class="mt-0.5 text-sm text-slate-500">
        Kelola profil akun Anda dan pengaturan workspace aktif.
      </p>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-base font-semibold text-slate-900">Profil Pengguna</h2>
      </template>

      <form class="space-y-4" @submit.prevent="saveProfile">
        <UFormField label="Email">
          <UInput :model-value="user?.email || ''" disabled class="w-full" />
        </UFormField>

        <UFormField label="Nama Lengkap" required>
          <UInput v-model="profileName" class="w-full" required />
        </UFormField>

        <div class="flex justify-end">
          <UButton type="submit" color="primary" :loading="savingProfile">
            Simpan Profil
          </UButton>
        </div>
      </form>
    </UCard>

    <UCard v-if="activeWorkspace">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-900">Pengaturan Workspace</h2>
          <UBadge v-if="!isOwner" color="neutral" variant="subtle" size="xs">
            Hanya Owner
          </UBadge>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="saveWorkspace">
        <UFormField label="Nama Workspace" required>
          <UInput v-model="wsName" :disabled="!isOwner" class="w-full" required />
        </UFormField>

        <UFormField label="Deskripsi Workspace">
          <UTextarea v-model="wsDesc" :disabled="!isOwner" class="w-full" />
        </UFormField>

        <div v-if="isOwner" class="flex justify-end">
          <UButton type="submit" color="primary" :loading="savingWs">
            Simpan Workspace
          </UButton>
        </div>
      </form>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-base font-semibold text-slate-900">Keamanan &amp; Password</h2>
      </template>

      <form class="space-y-4" @submit.prevent="savePassword">
        <UFormField label="Password Saat Ini" required>
          <PasswordInput v-model="currentPassword" required />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Password Baru" required>
            <PasswordInput
              v-model="newPassword"
              placeholder="Minimal 8 karakter"
              minlength="8"
              required
            />
          </UFormField>

          <UFormField label="Konfirmasi Password Baru" required>
            <PasswordInput
              v-model="confirmPassword"
              placeholder="Ulangi password baru"
              minlength="8"
              required
            />
          </UFormField>
        </div>

        <div class="flex items-center justify-between">
          <NuxtLink to="/forgot-password" class="text-xs font-medium text-indigo-600 hover:underline">
            Lupa password saat ini?
          </NuxtLink>
          <UButton type="submit" color="primary" :loading="savingPassword">
            Ubah Password
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
