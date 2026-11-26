<script setup lang="ts">
const steps = [
  {
    step: '01',
    title: 'Buat workspace',
    desc: 'Daftar gratis, namai ruang kerja sesuai tim atau klien.',
    icon: 'i-lucide-square-plus'
  },
  {
    step: '02',
    title: 'Atur proyek & tugas',
    desc: 'Buat proyek, bagi tugas, set prioritas dan tenggat.',
    icon: 'i-lucide-folder-plus'
  },
  {
    step: '03',
    title: 'Pantau progres',
    desc: 'Geser Kanban, cek kalender, baca laporan mingguan.',
    icon: 'i-lucide-line-chart'
  }
]
</script>

<template>
  <section id="cara-kerja" class="scroll-mt-20 bg-indigo-50/50 py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <LandingSectionHeader
        eyebrow="Cara kerja"
        title="Tiga langkah, langsung jalan"
        subtitle="Tanpa setup panjang, tim Anda bisa mulai hari ini."
      />

      <ol class="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-3 sm:gap-10">
        <li v-for="s in steps" :key="s.step">
          <div class="flex flex-col items-center text-center">
            <div class="relative flex items-center justify-center">
              <span
                class="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-200 bg-white text-indigo-700 shadow-2xs"
              >
                <UIcon :name="s.icon" class="h-6 w-6" />
              </span>
              <span
                class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white"
              >
                {{ s.step }}
              </span>
            </div>
            <h3 class="mt-5 text-base font-semibold text-slate-900">{{ s.title }}</h3>
            <p class="mt-2 max-w-[16rem] text-sm leading-relaxed text-slate-600">{{ s.desc }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
