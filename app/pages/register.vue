<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const route = useRoute()
const toast = useToast()
const { fetchSession, databaseConfigured } = useTaskoraSession()

const name = ref('')
const email = ref('')
const password = ref('')
const workspaceName = ref('')
const loading = ref(false)
const errorMsg = ref('')

function resolveRedirect(): string {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/dashboard'
}

async function handleRegister() {
  errorMsg.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
        workspaceName: workspaceName.value.trim() || undefined
      }
    })
    await fetchSession(true)
    toast.add({ title: 'Registrasi berhasil! Selamat datang di Taskbir.', color: 'success' })
    await navigateTo(resolveRedirect())
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Gagal mendaftar.'
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
            Mulai Gratis
          </p>
          <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Buat Akun Taskbir
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Mulai atur proyek dan tugas tim Anda secara terstruktur.
          </p>
        </div>
        <span class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
          <UIcon name="i-lucide-user-plus" class="h-5 w-5" />
        </span>
      </div>

      <UAlert
        v-if="!databaseConfigured"
        class="mb-5"
        color="warning"
        variant="subtle"
        icon="i-lucide-database"
        title="Database belum dikonfigurasi"
        description="Salin .env.example menjadi .env, isi kredensial TiDB, lalu jalankan npm run db:migrate sebelum mendaftar."
      />

      <form class="space-y-4" @submit.prevent="handleRegister">
        <UAlert
          v-if="errorMsg"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          :title="errorMsg"
        />

        <UFormField label="Nama Lengkap" required>
          <UInput
            v-model="name"
            size="lg"
            placeholder="Budi Santoso"
            icon="i-lucide-user"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Email" required>
          <UInput
            v-model="email"
            type="email"
            size="lg"
            placeholder="budi@agensi.com"
            icon="i-lucide-mail"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Password" required>
          <PasswordInput
            v-model="password"
            placeholder="Minimal 6 karakter"
            required
          />
        </UFormField>

        <UFormField label="Nama Workspace Pertama (Opsional)">
          <UInput
            v-model="workspaceName"
            size="lg"
            placeholder="Mis. Agensi Kreatif"
            icon="i-lucide-briefcase"
            class="w-full"
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
          Daftar &amp; Buat Workspace
        </UButton>
      </form>
    </div>

    <div class="space-y-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
      <p class="text-center text-sm text-slate-600">
        Sudah memiliki akun?
        <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Masuk di sini
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
