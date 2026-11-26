<template>
  <div class="grid min-h-screen bg-slate-50 lg:grid-cols-12">
    <!-- Left Editorial Showcase Panel (Desktop) -->
    <aside
      class="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-10 text-white lg:col-span-5 lg:flex xl:p-12"
    >
      <!-- Subtle architectural accent -->
      <div
        class="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden="true"
      />

      <!-- Brand & Back to Home -->
      <div class="relative z-10 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="inline-flex items-center gap-2.5 text-white transition-opacity hover:opacity-90">
          <TaskoraLogo size="md" class="ring-1 ring-white/20" />
          <span class="text-xl font-bold tracking-tight">Taskbir</span>
        </NuxtLink>

        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <UIcon name="i-lucide-arrow-left" class="h-3.5 w-3.5" />
          Beranda
        </NuxtLink>
      </div>

      <!-- Focal Narrative & Product Snapshot -->
      <div class="relative z-10 my-auto space-y-6 py-8">
        <div class="space-y-3">
          <h1 class="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            Kelola proyek, deadline, dan bukti kerja tim dalam satu tempat.
          </h1>
          <p class="max-w-md text-sm leading-relaxed text-indigo-100/80">
            Dirancang untuk agensi dan tim modern dengan kontrol peran Owner &amp; Anggota, papan Kanban, kalender proyek, serta pelacakan bukti kerja nyata.
          </p>
        </div>

        <!-- Realistic Product Snapshot -->
        <div class="rounded-2xl border border-white/15 bg-white/8 p-4 shadow-2xl backdrop-blur-sm">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p class="text-xs font-semibold text-white">Website Redesign 2026</p>
              <p class="text-[11px] text-indigo-200/80">Progres tim aktif</p>
            </div>
            <span class="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
              68% Selesai
            </span>
          </div>

          <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div class="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-400 to-amber-300" />
          </div>

          <div class="mt-3.5 flex items-center justify-between rounded-xl bg-slate-950/40 px-3 py-2.5">
            <div class="min-w-0">
              <p class="truncate text-xs font-medium text-white">Desain Wireframe Dashboard</p>
              <p class="text-[11px] text-indigo-200/75">Bukti: Link Figma &amp; Foto terlampir</p>
            </div>
            <span class="shrink-0 rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
              Review
            </span>
          </div>
        </div>
      </div>

      <!-- Grounded Capabilities Footer -->
      <div class="relative z-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-xs text-indigo-100/80">
        <div>
          <p class="font-semibold text-white">Single Owner</p>
          <p class="mt-0.5 text-[11px] text-indigo-200/70">Kontrol tugas rapi</p>
        </div>
        <div>
          <p class="font-semibold text-white">Bukti Kerja</p>
          <p class="mt-0.5 text-[11px] text-indigo-200/70">Link &amp; foto instan</p>
        </div>
        <div>
          <p class="font-semibold text-white">TiDB Cloud</p>
          <p class="mt-0.5 text-[11px] text-indigo-200/70">Sinkron real-time</p>
        </div>
      </div>
    </aside>

    <!-- Right Form Area -->
    <main class="flex flex-col justify-center px-4 py-10 sm:px-8 lg:col-span-7 lg:px-12">
      <div class="mx-auto w-full max-w-md">
        <!-- Mobile Brand Header -->
        <div class="mb-7 flex flex-col items-center text-center lg:hidden">
          <TaskoraLogo size="lg" class="shadow-md shadow-indigo-500/20" />
          <h1 class="mt-3 text-2xl font-bold tracking-tight text-slate-900">Taskbir</h1>
          <p class="mt-1 text-sm text-slate-500">
            Manajemen proyek &amp; tugas terstruktur untuk tim modern
          </p>
        </div>

        <slot />
      </div>
    </main>
  </div>
</template>
