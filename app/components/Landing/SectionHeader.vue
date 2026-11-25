<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    subtitle?: string
    align?: 'center' | 'left'
  }>(),
  {
    align: 'center'
  }
)
</script>

<template>
  <div :class="align === 'center' ? 'mx-auto max-w-xl text-center' : 'max-w-xl'">
    <p class="text-sm font-semibold uppercase tracking-wider text-indigo-600">{{ eyebrow }}</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="mt-3 text-slate-600">{{ subtitle }}</p>
  </div>
</template>
