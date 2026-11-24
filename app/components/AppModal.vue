<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  {
    description: undefined,
    maxWidth: 'lg'
  }
)

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm':
      return 'max-w-sm'
    case 'md':
      return 'max-w-md'
    case 'xl':
      return 'max-w-2xl'
    default:
      return 'max-w-lg'
  }
})

function close() {
  emit('update:open', false)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity"
        @click="close"
      />

      <!-- Modal Card -->
      <div
        class="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        :class="maxWidthClass"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div class="min-w-0">
            <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
            <p v-if="description" class="mt-0.5 text-xs text-slate-500">
              {{ description }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup"
            @click="close"
          >
            <UIcon name="i-lucide-x" class="h-4 w-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <slot name="body" :close="close" />
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="border-t border-slate-200 bg-slate-50/70 px-5 py-3"
        >
          <slot name="footer" :close="close" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
