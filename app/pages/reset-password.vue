<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const route = useRoute()
const toast = useToast()

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleReset() {
  errorMsg.value = ''
  if (!token.value) {
    errorMsg.value = 'Token reset password tidak ditemukan.'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
      }
    })
    toast.add({
      title: 'Password berhasil diatur ulang',
      description: 'Silakan masuk menggunakan password baru Anda.',
      color: 'success'
    })
    await navigateTo('/login')
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal mereset password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold text-slate-900">Atur Password Baru</h2>
      <p class="mt-0.5 text-sm text-slate-500">
        Buat password baru minimal 8 karakter untuk akun Taskora Anda.
      </p>
    </template>

    <form class="space-y-4" @submit.prevent="handleReset">
      <UAlert
        v-if="errorMsg"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :title="errorMsg"
      />

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

      <UButton type="submit" color="primary" block size="lg" :loading="loading">
        Simpan Password Baru
      </UButton>
    </form>

    <template #footer>
      <p class="text-center text-sm text-slate-600">
        <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Kembali ke Login
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
