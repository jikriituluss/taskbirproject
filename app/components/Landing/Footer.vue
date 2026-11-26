<template>
  <footer class="border-t border-slate-200 bg-white">
    <div
      class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 py-10 sm:px-6 md:grid-cols-3"
    >
      <div class="flex items-center gap-2.5 md:justify-start">
        <TaskoraLogo size="sm" />
        <span class="text-sm font-bold text-slate-900">Taskbir</span>
      </div>

      <nav class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
        <a href="#fitur" class="transition hover:text-slate-900">Fitur</a>
        <a href="#cara-kerja" class="transition hover:text-slate-900">Cara Kerja</a>
        <a href="#faq" class="transition hover:text-slate-900">FAQ</a>
        <NuxtLink to="/login" class="transition hover:text-slate-900">Masuk</NuxtLink>
        <NuxtLink to="/register" class="font-medium text-indigo-600 transition hover:text-indigo-700">
          Daftar
        </NuxtLink>
      </nav>

      <p class="text-xs text-slate-500 md:text-right">© {{ new Date().getFullYear() }} Taskbir</p>
    </div>
  </footer>
</template>
