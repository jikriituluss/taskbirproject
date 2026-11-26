<script setup lang="ts">
const reducedMotion = ref(false)
const mockEl = ref<HTMLElement | null>(null)
const highlight = ref(0)
const previewTab = ref<'kanban' | 'proofs' | 'progress'>('kanban')

const columns = [
  {
    title: 'To Do',
    tone: 'bg-slate-100 text-slate-600',
    tasks: ['Riset kompetitor', 'Draft brief kampanye', 'Review wireframe']
  },
  {
    title: 'In Progress',
    tone: 'bg-indigo-50 text-indigo-600',
    tasks: ['Desain landing page', 'Integrasi API']
  },
  {
    title: 'Done',
    tone: 'bg-emerald-50 text-emerald-600',
    tasks: ['Setup workspace', 'Undang tim']
  }
]

const totalTasks = columns.reduce((n, c) => n + c.tasks.length, 0)
let timer: number | undefined

function isActive(ci: number, ti: number): boolean {
  let start = 0
  for (let c = 0; c < ci; c++) start += columns[c]?.tasks.length ?? 0
  return highlight.value === start + ti
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion.value) return
  timer = window.setInterval(() => {
    highlight.value = (highlight.value + 1) % totalTasks
  }, 1800)
})

onUnmounted(() => {
  if (timer !== undefined) window.clearInterval(timer)
})

function onMouseMove(e: MouseEvent) {
  if (!mockEl.value || reducedMotion.value) return
  const rect = mockEl.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  mockEl.value.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`
}

function onMouseLeave() {
  if (!mockEl.value) return
  mockEl.value.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)'
}
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-indigo-50/90 via-indigo-50/40 to-slate-50 pt-24 pb-14 sm:pt-32 sm:pb-20">
    <div class="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.12]">
          Kerja tim jadi
          <span class="text-indigo-700 underline decoration-amber-400 decoration-4 underline-offset-8">
            rapi &amp; terukur
          </span>
        </h1>

        <p class="mt-5 text-base text-slate-600 sm:text-lg">
          Satu workspace untuk proyek, deadline berjam, bukti kerja foto &amp; link, serta kontrol peran Owner dan Anggota.
        </p>

        <div class="mt-7 flex flex-wrap items-center justify-center gap-3">
          <UButton
            to="/register"
            color="primary"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
            class="shadow-lg shadow-indigo-600/20"
          >
            Mulai Gratis
          </UButton>
          <UButton to="/login" color="neutral" variant="outline" size="lg" icon="i-lucide-log-in">
            Masuk
          </UButton>
        </div>
      </div>

      <div class="mt-10 sm:mt-14" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
        <div
          ref="mockEl"
          class="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-transform duration-200 ease-out will-change-transform"
        >
          <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div class="flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span class="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span class="ml-3 hidden text-xs font-medium text-slate-500 sm:block">app.taskbir.id/dashboard</span>
            </div>

            <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-semibold">
              <button
                v-for="tab in [
                  { id: 'kanban', label: 'Kanban' },
                  { id: 'proofs', label: 'Bukti Kerja' },
                  { id: 'progress', label: 'Progres' }
                ] as const"
                :key="tab.id"
                type="button"
                class="rounded-md px-2.5 py-1 transition-colors"
                :class="
                  previewTab === tab.id
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                "
                @click="previewTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-[6.5rem_1fr]">
            <aside class="hidden border-r border-slate-100 bg-slate-50/70 p-3 sm:block">
              <div class="space-y-1.5">
                <div
                  v-for="(label, i) in ['Dashboard', 'Tasks', 'Projects', 'Kanban']"
                  :key="label"
                  class="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium"
                  :class="i === 0 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="i === 0 ? 'bg-indigo-500' : 'bg-slate-300'" />
                  {{ label }}
                </div>
              </div>
            </aside>

            <div class="p-4 sm:p-5">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-slate-900">Sprint Marketing</p>
                  <p class="text-xs text-slate-500">6 tugas · 3 anggota</p>
                </div>
                <div class="flex -space-x-2">
                  <span
                    v-for="av in [
                      { label: 'A', cls: 'bg-indigo-100 text-indigo-700' },
                      { label: 'B', cls: 'bg-amber-100 text-amber-800' },
                      { label: 'C', cls: 'bg-indigo-50 text-indigo-700' }
                    ]"
                    :key="av.label"
                    class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold"
                    :class="av.cls"
                  >
                    {{ av.label }}
                  </span>
                </div>
              </div>

              <div v-if="previewTab === 'kanban'" class="grid grid-cols-3 gap-2 sm:gap-3">
                <div
                  v-for="(col, ci) in columns"
                  :key="col.title"
                  class="rounded-lg bg-slate-50 p-2"
                >
                  <div class="mb-2 flex items-center justify-between">
                    <span class="rounded px-1.5 py-0.5 text-[10px] font-semibold" :class="col.tone">
                      {{ col.title }}
                    </span>
                    <span class="text-[10px] text-slate-500">{{ col.tasks.length }}</span>
                  </div>
                  <div class="space-y-1.5">
                    <div
                      v-for="(task, ti) in col.tasks"
                      :key="task"
                      class="rounded-md border bg-white p-2 text-[11px] leading-snug text-slate-700 transition-all duration-500"
                      :class="
                        isActive(ci, ti)
                          ? 'border-indigo-300 shadow-md shadow-indigo-500/20 -translate-y-0.5'
                          : 'border-slate-100 shadow-sm'
                      "
                    >
                      {{ task }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="previewTab === 'proofs'" class="space-y-2">
                <div
                  v-for="item in [
                    { title: 'Desain Wireframe Dashboard', owner: 'Siti Rahma', badge: 'Link + Foto' },
                    { title: 'Integrasi TiDB Cloud', owner: 'Budi Santoso', badge: 'Link PR' },
                    { title: 'Uji Kontras Light Mode', owner: 'Dewi Lestari', badge: 'Foto Bukti' }
                  ]"
                  :key="item.title"
                  class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
                >
                  <div>
                    <p class="text-xs font-semibold text-slate-900">{{ item.title }}</p>
                    <p class="text-[11px] text-slate-500">Penanggung jawab: {{ item.owner }}</p>
                  </div>
                  <span class="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {{ item.badge }}
                  </span>
                </div>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="m in [
                    { name: 'Raka Pratama (Owner)', pct: 100, count: '8/8 selesai' },
                    { name: 'Siti Rahma (Anggota)', pct: 80, count: '4/5 selesai' },
                    { name: 'Budi Santoso (Anggota)', pct: 50, count: '3/6 selesai' }
                  ]"
                  :key="m.name"
                  class="space-y-1 rounded-lg bg-slate-50 p-2.5"
                >
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-semibold text-slate-800">{{ m.name }}</span>
                    <span class="font-medium text-indigo-700">{{ m.count }}</span>
                  </div>
                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div class="h-full rounded-full bg-indigo-600" :style="{ width: `${m.pct}%` }" />
                  </div>
                </div>
              </div>

              <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-600 to-amber-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
