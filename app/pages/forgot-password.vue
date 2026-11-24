<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const resetUrl = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  resetUrl.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ ok: boolean; message: string; resetUrl?: string }>(
      '/api/auth/forgot-password',
      {
        method: 'POST',
        body: { email: email.value }
      }
    )
    successMsg.value = res.message
    resetUrl.value = res.resetUrl || ''
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal memproses permintaan.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold text-slate-900">Lupa Password</h2>
      <p class="mt-0.5 text-sm text-slate-500">
        Masukkan email terdaftar Anda untuk membuat tautan reset password.
      </p>
    </template>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <UAlert
        v-if="errorMsg"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :title="errorMsg"
      />

      <UAlert
        v-if="successMsg"
        color="success"
        variant="subtle"
        icon="i-lucide-check-circle-2"
        :title="successMsg"
      >
        <template v-if="resetUrl" #description>
          <p class="mt-1 text-xs text-slate-700">
            Klik tombol berikut untuk langsung mengatur ulang password Anda:
          </p>
          <UButton :to="resetUrl" size="xs" color="primary" class="mt-2" icon="i-lucide-key-round">
            Reset Password Sekarang
          </UButton>
        </template>
      </UAlert>

      <UFormField label="Email" required>
        <UInput
          v-model="email"
          type="email"
          placeholder="akun@gmail.com"
          icon="i-lucide-mail"
          class="w-full"
          required
        />
      </UFormField>

      <UButton type="submit" color="primary" block size="lg" :loading="loading">
        Kirim Tautan Reset
      </UButton>
    </form>

    <template #footer>
      <p class="text-center text-sm text-slate-600">
        Ingat password Anda?
        <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Kembali ke Login
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
