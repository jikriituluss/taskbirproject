<script setup lang="ts">
const reducedMotion = ref(false)
const mockEl = ref<HTMLElement | null>(null)
const highlight = ref(0)

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
  <section class="relative overflow-hidden pt-24 pb-14 sm:pt-32 sm:pb-20">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(79,70,229,0.12),transparent)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <span
          class="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
        >
          <UIcon name="i-lucide-sparkles" class="h-3.5 w-3.5" />
          Manajemen tim modern
        </span>

        <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1]">
          Kerja tim jadi
          <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            rapi & cepat
          </span>
        </h1>

        <p class="mt-4 text-base text-slate-600 sm:text-lg">
          Satu tempat untuk tugas, proyek, dan progres tim — tanpa drama spreadsheet.
        </p>

        <div class="mt-7 flex flex-wrap items-center justify-center gap-3">
          <UButton
            to="/register"
            color="primary"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
            class="shadow-lg shadow-indigo-500/25"
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
          class="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-transform duration-200 ease-out will-change-transform"
        >
          <div class="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3">
            <span class="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span class="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span class="ml-3 hidden text-xs text-slate-400 sm:block">app.taskbir.id/dashboard</span>
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
                    v-for="c in ['A', 'B', 'C']"
                    :key="c"
                    class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[10px] font-bold text-indigo-700"
                  >
                    {{ c }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 sm:gap-3">
                <div
                  v-for="(col, ci) in columns"
                  :key="col.title"
                  class="rounded-lg bg-slate-50 p-2"
                >
                  <div class="mb-2 flex items-center justify-between">
                    <span class="rounded px-1.5 py-0.5 text-[10px] font-semibold" :class="col.tone">
                      {{ col.title }}
                    </span>
                    <span class="text-[10px] text-slate-400">{{ col.tasks.length }}</span>
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

              <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
