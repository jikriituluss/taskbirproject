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
  <div class="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
    <div class="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500" />

    <div class="p-6 sm:p-8">
      <div class="mb-6 flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Keamanan Akun
          </p>
          <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Atur Password Baru
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Buat password baru minimal 8 karakter untuk akun Taskbir Anda.
          </p>
        </div>
        <span class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
          <UIcon name="i-lucide-lock-keyhole" class="h-5 w-5" />
        </span>
      </div>

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

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          :loading="loading"
          class="mt-2 shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg hover:shadow-indigo-600/25"
        >
          Simpan Password Baru
        </UButton>
      </form>
    </div>

    <div class="border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
      <p class="text-center text-sm text-slate-600">
        <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Kembali ke Masuk
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
