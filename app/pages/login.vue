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
  return '/'
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
    toast.add({ title: 'Berhasil masuk ke Taskora', color: 'success' })
    await navigateTo(resolveRedirect())
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal login.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold text-slate-900">Masuk ke Akun Anda</h2>
      <p class="mt-0.5 text-sm text-slate-500">Kelola proyek dan tugas tim Anda di Taskora.</p>
    </template>

    <UAlert
      v-if="!databaseConfigured"
      class="mb-4"
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
      >
        Masuk
      </UButton>
    </form>

    <template #footer>
      <p class="text-center text-sm text-slate-600">
        Belum punya akun?
        <NuxtLink to="/register" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Daftar sekarang
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
