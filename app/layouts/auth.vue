<template>
  <div class="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-md">
      <div class="mb-8 flex flex-col items-center text-center">
        <TaskoraLogo size="lg" class="shadow-md shadow-indigo-500/20" />
        <h1 class="mt-4 text-2xl font-bold tracking-tight text-slate-900">Taskora</h1>
        <p class="mt-1 text-sm text-slate-500">
          Manajemen proyek &amp; tugas terstruktur untuk tim modern
        </p>
      </div>
      <slot />
    </div>
  </div>
</template>
