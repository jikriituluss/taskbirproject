<script setup lang="ts">
const features = [
  {
    id: 'tasks',
    title: 'My Tasks',
    desc: 'Fokus ke pekerjaan hari ini.',
    icon: 'i-lucide-check-circle-2',
    detail: 'Semua tugas yang ditugaskan ke Anda, diurutkan prioritas & tenggat.',
    preview: {
      heading: 'Hari ini',
      items: [
        { label: 'Kirim laporan mingguan', done: true },
        { label: 'Review desain hero', done: true },
        { label: 'Follow up klien', done: false },
        { label: 'Update jadwal sprint', done: false }
      ]
    }
  },
  {
    id: 'projects',
    title: 'Projects',
    desc: 'Semua proyek dalam satu papan.',
    icon: 'i-lucide-folder-kanban',
    detail: 'Progres otomatis dari rasio tugas selesai, plus anggota & deadline.',
    preview: {
      heading: 'Proyek aktif',
      items: [
        { label: 'Website Redesign · 80%', done: false },
        { label: 'Kampanye Q4 · 45%', done: false },
        { label: 'Mobile App MVP · 20%', done: false },
        { label: 'Brand Guide · 100%', done: true }
      ]
    }
  },
  {
    id: 'kanban',
    title: 'Kanban',
    desc: 'Geser status, lihat alur kerja.',
    icon: 'i-lucide-columns-3',
    detail: 'Empat kolom: To Do, In Progress, Review, Done — drag & drop.',
    preview: {
      heading: 'Papan tim',
      items: [
        { label: 'Backlog → To Do: 4 kartu', done: false },
        { label: 'In Progress: 2 kartu', done: false },
        { label: 'Review: 1 kartu', done: false },
        { label: 'Done minggu ini: 9', done: true }
      ]
    }
  },
  {
    id: 'calendar',
    title: 'Calendar',
    desc: 'Deadline tak lagi terlewat.',
    icon: 'i-lucide-calendar',
    detail: 'Gabungan tenggat tugas & rentang proyek dalam satu tampilan.',
    preview: {
      heading: 'Pekan ini',
      items: [
        { label: 'Sen · Standup tim', done: true },
        { label: 'Rabu · Review sprint', done: false },
        { label: 'Jum · Demo klien', done: false },
        { label: 'Min · Rencana pekan depan', done: false }
      ]
    }
  },
  {
    id: 'team',
    title: 'Team',
    desc: 'Bagi tugas ke anggota tepat.',
    icon: 'i-lucide-users',
    detail: 'Undang anggota, atur role Owner/Anggota, lihat beban kerja.',
    preview: {
      heading: 'Anggota workspace',
      items: [
        { label: 'Ayu · Desainer · 5 tugas', done: false },
        { label: 'Bima · Developer · 8 tugas', done: false },
        { label: 'Citra · Writer · 3 tugas', done: false },
        { label: 'Danu · PM · 4 tugas', done: false }
      ]
    }
  },
  {
    id: 'reports',
    title: 'Reports',
    desc: 'Progres tim sekilas pandang.',
    icon: 'i-lucide-bar-chart-3',
    detail: 'Tugas selesai, terlambat, dan % progres tiap proyek.',
    preview: {
      heading: 'Ringkasan bulan ini',
      items: [
        { label: 'Tugas selesai: 42', done: true },
        { label: 'Tingkat penyelesaian: 76%', done: true },
        { label: 'Terlambat: 3', done: false },
        { label: 'Rata-rata cycle: 2,4 hari', done: false }
      ]
    }
  }
] as const

const activeId = ref<string>(features[0].id)
const active = computed(() => features.find((f) => f.id === activeId.value) ?? features[0])
</script>

<template>
  <section id="fitur" class="scroll-mt-20 border-y border-slate-200 bg-white py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <LandingSectionHeader
        eyebrow="Fitur"
        title="Semua yang tim butuh"
        subtitle="Klik salah satu untuk melihat sekilas isinya."
      />

      <div class="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[1fr_1.15fr] lg:items-stretch">
        <div class="grid grid-cols-2 content-start gap-3 sm:gap-4">
          <button
            v-for="f in features"
            :key="f.id"
            type="button"
            class="group rounded-xl border p-4 text-left transition-all duration-200 sm:p-5"
            :class="
              activeId === f.id
                ? 'border-indigo-300 bg-indigo-50/70 shadow-lg shadow-indigo-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
            "
            :aria-pressed="activeId === f.id"
            @click="activeId = f.id"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
              :class="activeId === f.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'"
            >
              <UIcon :name="f.icon" class="h-4.5 w-4.5" />
            </span>
            <p class="mt-3 text-sm font-semibold text-slate-900">{{ f.title }}</p>
            <p class="mt-1 text-xs leading-relaxed text-slate-500">{{ f.desc }}</p>
          </button>
        </div>

        <div
          class="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6"
          role="region"
          aria-live="polite"
        >
          <div class="flex items-center gap-3 border-b border-slate-200/70 pb-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <UIcon :name="active.icon" class="h-4.5 w-4.5" />
            </span>
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ active.title }}</p>
              <p class="text-xs text-slate-500">{{ active.preview.heading }}</p>
            </div>
          </div>

          <p class="mt-4 text-sm leading-relaxed text-slate-600">{{ active.detail }}</p>

          <ul class="mt-4 flex-1 space-y-2.5">
            <li
              v-for="(item, i) in active.preview.items"
              :key="item.label"
              class="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white px-3.5 py-3 text-sm text-slate-700"
              :class="item.done ? 'text-slate-400 line-through decoration-slate-300' : ''"
            >
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                :class="item.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'"
              >
                <UIcon v-if="item.done" name="i-lucide-check" class="h-3 w-3" />
              </span>
              {{ item.label }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
