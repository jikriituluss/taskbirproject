<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string | null
    title?: string
  }>(),
  {
    title: 'Bukti Foto Pekerjaan'
  }
)

const emit = defineEmits<{
  close: []
}>()

async function openInNewTab() {
  if (!props.src) return
  if (props.src.startsWith('data:')) {
    try {
      const res = await fetch(props.src)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
      return
    } catch {
      // Fallback bila browser menolak fetch data URL
    }
  }
  window.open(props.src, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <AppModal
    :open="Boolean(src)"
    :title="title"
    max-width="xl"
    @update:open="(val) => { if (!val) emit('close') }"
  >
    <template #body>
      <div v-if="src" class="flex justify-center">
        <img
          :src="src"
          alt="Bukti pekerjaan"
          class="max-h-[72vh] rounded-lg border border-slate-200 object-contain"
        >
      </div>
    </template>
    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UButton
            v-if="src"
            type="button"
            size="sm"
            color="primary"
            variant="soft"
            icon="i-lucide-external-link"
            @click="openInNewTab"
          >
            Buka di Tab Baru
          </UButton>
          <a
            v-if="src"
            :href="src"
            download="bukti-pekerjaan.png"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <UIcon name="i-lucide-download" class="h-3.5 w-3.5" />
            Unduh Foto
          </a>
        </div>

        <UButton type="button" color="neutral" variant="outline" @click="emit('close')">
          Tutup
        </UButton>
      </div>
    </template>
  </AppModal>
</template>
