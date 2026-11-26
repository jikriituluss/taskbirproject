<script setup lang="ts">
const problems = [
  {
    icon: 'i-lucide-message-square-warning',
    title: 'Tugas tercecer di chat',
    solution: 'Status terstruktur: To Do, In Progress, Review, Done.'
  },
  {
    icon: 'i-lucide-eye-off',
    title: 'Progres proyek kabur',
    solution: 'Dashboard & laporan selalu menampilkan angka terkini.'
  },
  {
    icon: 'i-lucide-clock-alert',
    title: 'Deadline mudah terlewat',
    solution: 'Kalender & pengingat tenggat lintas proyek.'
  },
  {
    icon: 'i-lucide-users-round',
    title: 'Hak akses campur aduk',
    solution: 'Workspace terpisah per klien/tim, role jelas.'
  }
]
</script>

<template>
  <section class="bg-slate-50 py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <LandingSectionHeader
        eyebrow="Kenapa Taskbir"
        title="Masalah tim kecil, solusi ringkas"
        subtitle="Empat hambatan yang paling sering muncul dan cara kami menanganinya."
      />

      <div class="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:mt-14">
        <article
          v-for="p in problems"
          :key="p.title"
          class="group flex items-start gap-4 bg-white p-5 transition-colors duration-200 hover:bg-indigo-50/40 sm:p-6"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 transition-colors duration-200 group-hover:bg-indigo-600 group-hover:text-white"
          >
            <UIcon :name="p.icon" class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <h3 class="text-sm font-semibold text-slate-900 sm:text-base">{{ p.title }}</h3>
            <p class="mt-1 flex items-start gap-1.5 text-sm leading-relaxed text-slate-600">
              <UIcon name="i-lucide-arrow-right" class="mt-1 h-3.5 w-3.5 shrink-0 text-indigo-600" />
              {{ p.solution }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
