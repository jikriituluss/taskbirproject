<script setup lang="ts">
const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    placeholder?: string
    icon?: string
    minlength?: number | string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    placeholder: '••••••••',
    icon: 'i-lucide-lock',
    minlength: undefined,
    required: false,
    disabled: false
  }
)

const show = ref(false)
</script>

<template>
  <UInput
    v-model="model"
    :type="show ? 'text' : 'password'"
    :placeholder="placeholder"
    :icon="icon"
    :minlength="minlength"
    :required="required"
    :disabled="disabled"
    :ui="{ trailing: 'pe-1' }"
    class="w-full"
  >
    <template #trailing>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="show ? 'Sembunyikan password' : 'Lihat password'"
        :aria-pressed="show"
        @click="show = !show"
      />
    </template>
  </UInput>
</template>
