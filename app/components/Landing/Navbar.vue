<script setup lang="ts">
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="
      scrolled ? 'border-b border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm' : 'border-b border-transparent bg-transparent'
    "
  >
    <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <NuxtLink to="/" class="flex items-center gap-2.5" aria-label="Taskbir beranda">
        <TaskoraLogo size="sm" />
        <span class="text-lg font-bold tracking-tight text-slate-900">Taskbir</span>
      </NuxtLink>

      <div class="hidden items-center gap-1 md:flex">
        <a
          href="#fitur"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Fitur
        </a>
        <a
          href="#cara-kerja"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Cara Kerja
        </a>
        <a
          href="#faq"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          FAQ
        </a>
      </div>

      <div class="flex items-center gap-2">
        <UButton to="/login" color="neutral" variant="ghost" size="sm">Masuk</UButton>
        <UButton to="/register" color="primary" size="sm" trailing-icon="i-lucide-arrow-right">
          Daftar Gratis
        </UButton>
      </div>
    </nav>
  </header>
</template>
