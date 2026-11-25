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
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold text-slate-900">Buat Akun Baru</h2>
      <p class="mt-0.5 text-sm text-slate-500">
        Mulai atur proyek dan tugas tim Anda secara terstruktur.
      </p>
    </template>

    <UAlert
      v-if="!databaseConfigured"
      class="mb-4"
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
      >
        Daftar &amp; Buat Workspace
      </UButton>
    </form>

    <template #footer>
      <p class="text-center text-sm text-slate-600">
        Sudah memiliki akun?
        <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Masuk di sini
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
