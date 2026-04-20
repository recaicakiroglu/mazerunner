<template>
  <input
    type="search"
    class="px-4 py-2 rounded-lg bg-bg-primary border border-white/20 placeholder:text-text-secondary outline-none transition focus:border-white/40 focus:bg-bg-card"
    placeholder="Search shows..."
    :value="modelValue"
    aria-label="Search TV shows"
    @input="onInput"
  />
</template>

<script setup lang="ts">
  defineProps<{ modelValue: string }>()
  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  function onInput(e: Event) {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
  }
</script>
