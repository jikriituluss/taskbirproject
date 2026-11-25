<script setup lang="ts">
const audiences = [
  {
    icon: 'i-lucide-laptop',
    title: 'Freelancer',
    desc: 'Pisahkan proyek klien per workspace, jaga fokus tugas harian.',
    bullets: ['Deadline per klien', 'My Tasks harian', 'Bukti penyelesaian']
  },
  {
    icon: 'i-lucide-building-2',
    title: 'Agensi & PM',
    desc: 'Atur tim, prioritas, dan progres proyek dalam satu papan.',
    bullets: ['Bagi tugas & role', 'Laporan keterlambatan', 'Kanban drag-and-drop']
  },
  {
    icon: 'i-lucide-user-round',
    title: 'Anggota tim',
    desc: 'Lihat tugas Anda, perbarui status, diskusi lewat komentar.',
    bullets: ['Filter tugas sendiri', 'Update status cepat', 'Komentar di tugas']
  }
]
</script>

<template>
  <section class="bg-white py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <LandingSectionHeader
        eyebrow="Untuk siapa"
        title="Dibuat untuk cara kerja Anda"
      />

      <div class="mt-10 grid gap-4 md:grid-cols-3 md:gap-5 lg:mt-14">
        <article
          v-for="a in audiences"
          :key="a.title"
          class="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5"
        >
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
            <UIcon :name="a.icon" class="h-5 w-5" />
          </span>
          <h3 class="mt-4 text-base font-semibold text-slate-900">{{ a.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ a.desc }}</p>
          <ul class="mt-auto space-y-2 border-t border-slate-200/80 pt-4">
            <li v-for="b in a.bullets" :key="b" class="flex items-center gap-2 text-sm text-slate-700">
              <UIcon name="i-lucide-check" class="h-4 w-4 shrink-0 text-emerald-500" />
              {{ b }}
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>
