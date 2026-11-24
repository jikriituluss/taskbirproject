<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  created: [workspaceId: string]
}>()

const toast = useToast()
const { fetchSession, switchWorkspace } = useTaskoraSession()

const isOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit('update:open', val)
})

const name = ref('')
const description = ref('')
const saving = ref(false)

watch(
  () => props.open,
  (open) => {
    if (open) {
      name.value = ''
      description.value = ''
    }
  }
)

async function handleCreate() {
  if (!name.value.trim() || saving.value) return
  saving.value = true
  try {
    const res = await $fetch<{ workspace: { id: string; name: string } }>('/api/workspaces', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        description: description.value.trim() || undefined
      }
    })
    await fetchSession(true)
    switchWorkspace(res.workspace.id)
    emit('update:open', false)
    emit('created', res.workspace.id)
    toast.add({ title: 'Workspace berhasil dibuat', color: 'success' })
  } catch (err: any) {
    toast.add({
      title: 'Gagal membuat workspace',
      description: err?.data?.statusMessage || err?.message,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppModal
    :open="open"
    title="Buat Workspace Baru"
    description="Workspace memisahkan ruang kerja antar klien atau tim."
    @update:open="(val) => emit('update:open', val)"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="handleCreate">
        <UFormField label="Nama Workspace" required>
          <UInput
            v-model="name"
            placeholder="Mis. Studio Kreatif"
            class="w-full"
            required
            :disabled="saving"
          />
        </UFormField>
        <UFormField label="Deskripsi">
          <UTextarea
            v-model="description"
            placeholder="Deskripsi singkat workspace..."
            class="w-full"
            :disabled="saving"
          />
        </UFormField>
        <div class="flex justify-end gap-2 pt-2">
          <UButton type="button" color="neutral" variant="ghost" :disabled="saving" @click="isOpen = false">
            Batal
          </UButton>
          <UButton type="submit" color="primary" :loading="saving"> Simpan Workspace </UButton>
        </div>
      </form>
    </template>
  </AppModal>
</template>
