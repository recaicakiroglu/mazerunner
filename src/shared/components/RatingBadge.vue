<template>
  <span
    class="flex items-center gap-1 font-bold shrink-0"
    :class="sizeClass"
    :aria-label="`Rating: ${rating ?? 'Not rated'}`"
  >
    <Star
      aria-hidden="true"
      class="text-accent shrink-0"
      :class="starSizeClass"
      fill="currentColor"
    />
    <span aria-hidden="true">{{ rating ?? 'N/A' }}</span>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Star } from 'lucide-vue-next'

  const props = defineProps<{ rating: number | null; size?: 'sm' | 'lg' }>()

  const sizeClass = computed(() => (props.size === 'lg' ? 'text-[1.2rem]' : 'text-[0.8rem]'))
  const starSizeClass = computed(() => (props.size === 'lg' ? 'w-5 h-5' : 'w-3 h-3'))
</script>
