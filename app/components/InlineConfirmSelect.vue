<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    items: Array<{ label: string; value: string }>
    size?: 'xs' | 'sm' | 'md'
    selectClass?: string
    disabled?: boolean
    saving?: boolean
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  {
    size: 'xs',
    selectClass: 'w-32',
    disabled: false,
    saving: false,
    confirmLabel: 'Simpan perubahan',
    cancelLabel: 'Batalkan perubahan'
  }
)

const emit = defineEmits<{
  confirm: [value: string]
}>()

const draft = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    draft.value = val
  }
)

const hasChanges = computed(() => draft.value !== props.modelValue)

function cancel() {
  draft.value = props.modelValue
}

function submit() {
  if (!hasChanges.value || props.saving) return
  emit('confirm', draft.value)
}
</script>

<template>
  <div class="inline-flex items-center gap-1.5">
    <USelect
      v-model="draft"
      :items="items"
      :size="size"
      :disabled="disabled || saving"
      :class="selectClass"
    />
    <template v-if="hasChanges">
      <UButton
        icon="i-lucide-check"
        size="xs"
        color="success"
        variant="soft"
        :loading="saving"
        :aria-label="confirmLabel"
        :title="confirmLabel"
        @click="submit"
      />
      <UButton
        icon="i-lucide-x"
        size="xs"
        color="neutral"
        variant="ghost"
        :disabled="saving"
        :aria-label="cancelLabel"
        :title="cancelLabel"
        @click="cancel"
      />
    </template>
  </div>
</template>
