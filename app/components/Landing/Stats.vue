<script setup lang="ts">
const stats = [
  { value: '4', label: 'Status tugas', hint: 'Todo · Progress · Review · Done' },
  { value: '6', label: 'Modul inti', hint: 'Tasks hingga Reports' },
  { value: '2', label: 'Role workspace', hint: 'Owner & Anggota' },
  { value: '∞', label: 'Proyek & klien', hint: 'Pisah per workspace' }
]
</script>

<template>
  <section aria-label="Ringkasan angka" class="border-y border-slate-200 bg-white">
    <div class="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4">
      <div v-for="s in stats" :key="s.label" class="text-center lg:text-left">
        <p class="text-3xl font-extrabold tracking-tight text-indigo-600 sm:text-4xl">{{ s.value }}</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ s.label }}</p>
        <p class="mt-0.5 text-xs text-slate-500">{{ s.hint }}</p>
      </div>
    </div>
  </section>
</template>
