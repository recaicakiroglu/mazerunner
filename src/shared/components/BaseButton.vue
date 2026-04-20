<template>
  <component
    :is="tag"
    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-[0.9rem] border transition-colors duration-150 cursor-pointer"
    :class="variantClass"
    v-bind="props.to ? { to: props.to } : {}"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
  import { computed, useAttrs, resolveComponent } from 'vue'

  const props = defineProps<{ variant?: 'outline' | 'filled'; to?: string | object }>()
  const attrs = useAttrs()

  const tag = computed(() => {
    if (props.to) {
      return resolveComponent('RouterLink')
    }
    if (attrs.href) {
      return 'a'
    }
    return 'button'
  })

  const variantClass = computed(() =>
    props.variant === 'filled'
      ? 'bg-accent hover:bg-accent-hover text-bg-primary border-transparent'
      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface border-white/10 hover:border-white/20'
  )
</script>
