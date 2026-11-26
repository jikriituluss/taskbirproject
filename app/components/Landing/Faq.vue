<script setup lang="ts">
const items = [
  {
    label: 'Apakah Taskbir gratis untuk dicoba?',
    icon: 'i-lucide-gift',
    content:
      'Ya. Daftar dan buat workspace langsung dari halaman ini, tanpa kartu kredit untuk mulai mengelola proyek dan tugas.'
  },
  {
    label: 'Apa bedanya My Tasks dan Kanban?',
    icon: 'i-lucide-layout-list',
    content:
      'My Tasks fokus pada daftar tugas yang ditugaskan ke Anda (prioritas harian). Kanban menampilkan seluruh alur kerja tim per status: To Do, In Progress, Review, dan Done.'
  },
  {
    label: 'Bagaimana memisahkan proyek klien?',
    icon: 'i-lucide-folder-lock',
    content:
      'Gunakan workspace terpisah untuk tiap tim atau klien. Di dalamnya, buat banyak proyek dengan anggota, deadline, dan laporan masing-masing.'
  },
  {
    label: 'Siapa yang bisa mengatur anggota & proyek?',
    icon: 'i-lucide-shield-check',
    content:
      'Owner mengelola workspace, anggota, dan proyek. Anggota (member) mengelola tugas yang ditugaskan kepadanya, mengubah status, serta menambahkan komentar.'
  },
  {
    label: 'Apakah ada laporan progres?',
    icon: 'i-lucide-bar-chart-3',
    content:
      'Ada. Reports menampilkan total proyek, tugas selesai & belum selesai, tugas terlambat, serta persentase progres tiap proyek.'
  }
]
</script>

<template>
  <section id="faq" class="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-16 sm:py-24">
    <div class="mx-auto max-w-3xl px-4 sm:px-6">
      <LandingSectionHeader
        eyebrow="FAQ"
        title="Pertanyaan yang sering muncul"
      />

      <div class="mt-10 space-y-3 lg:mt-14">
        <details
          v-for="item in items"
          :key="item.label"
          class="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors open:border-indigo-200 open:bg-indigo-50/30"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden"
          >
            <span class="flex items-center gap-2.5">
              <UIcon :name="item.icon" class="h-4 w-4 shrink-0 text-indigo-600" />
              {{ item.label }}
            </span>
            <UIcon
              name="i-lucide-chevron-down"
              class="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p class="border-t border-slate-100 px-5 pt-3 pb-4 text-sm leading-relaxed text-slate-600">
            {{ item.content }}
          </p>
        </details>
      </div>

      <p class="mt-8 text-center text-sm text-slate-500">
        Masih ada pertanyaan?
        <NuxtLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-700">
          Mulai gratis
        </NuxtLink>
        atau
        <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-700">
          masuk
        </NuxtLink>
        untuk mencoba langsung.
      </p>
    </div>
  </section>
</template>
