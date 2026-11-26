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
  <div class="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
    <div class="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500" />

    <div class="p-6 sm:p-8">
      <div class="mb-6 flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Pemulihan Akun
          </p>
          <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Lupa Password
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Masukkan email terdaftar Anda untuk membuat tautan reset password.
          </p>
        </div>
        <span class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
          <UIcon name="i-lucide-key-round" class="h-5 w-5" />
        </span>
      </div>

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
            size="lg"
            placeholder="akun@gmail.com"
            icon="i-lucide-mail"
            class="w-full"
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
          Kirim Tautan Reset
        </UButton>
      </form>
    </div>

    <div class="space-y-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
      <p class="text-center text-sm text-slate-600">
        Ingat password Anda?
        <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Kembali ke Masuk
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
