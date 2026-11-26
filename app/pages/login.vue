<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const route = useRoute()
const toast = useToast()
const { fetchSession, databaseConfigured } = useTaskoraSession()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

function resolveRedirect(): string {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/dashboard'
}

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })
    await fetchSession(true)
    toast.add({ title: 'Berhasil masuk ke Taskbir', color: 'success' })
    await navigateTo(resolveRedirect())
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal login.'
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
            Akses Workspace
          </p>
          <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Selamat datang kembali
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Masuk untuk melanjutkan proyek dan tugas tim Anda di Taskbir.
          </p>
        </div>
        <span class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
          <UIcon name="i-lucide-shield-check" class="h-5 w-5" />
        </span>
      </div>

      <UAlert
        v-if="!databaseConfigured"
        class="mb-5"
        color="warning"
        variant="subtle"
        icon="i-lucide-database"
        title="Database belum dikonfigurasi"
        description="Salin .env.example menjadi .env, isi kredensial TiDB, lalu jalankan npm run db:migrate sebelum masuk."
      />

      <form class="space-y-4" @submit.prevent="handleLogin">
        <UAlert
          v-if="errorMsg"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          :title="errorMsg"
        />

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

        <UFormField label="Password" required>
          <template #hint>
            <NuxtLink to="/forgot-password" class="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Lupa password?
            </NuxtLink>
          </template>
          <PasswordInput
            v-model="password"
            placeholder="••••••••"
            required
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          :loading="loading"
          :disabled="!databaseConfigured"
          class="mt-2 shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg hover:shadow-indigo-600/25"
        >
          Masuk
        </UButton>
      </form>
    </div>

    <div class="space-y-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
      <p class="text-center text-sm text-slate-600">
        Belum punya akun?
        <NuxtLink to="/register" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Daftar sekarang
        </NuxtLink>
      </p>
      <UButton
        to="/"
        color="neutral"
        variant="ghost"
        block
        size="sm"
        icon="i-lucide-arrow-left"
      >
        Kembali ke Beranda
      </UButton>
    </div>
  </div>
</template>
