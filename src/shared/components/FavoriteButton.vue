<template>
  <button
    class="flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer bg-black/75"
    :class="[sizeClasses, { 'md:opacity-0 group-hover:opacity-100': !alwaysVisible }]"
    :aria-label="isFav ? 'Remove from favorites' : 'Add to favorites'"
    :aria-pressed="isFav"
    @click.prevent.stop="favStore.toggle(show)"
    @mouseenter="heartHovered = true"
    @mouseleave="heartHovered = false"
  >
    <Heart
      aria-hidden="true"
      class="transition-opacity duration-150 opacity-100"
      :class="[
        iconSizeClass,
        heartColor,
        { 'md:opacity-0 group-hover:opacity-100': !alwaysVisible },
      ]"
      :fill="isFav ? 'currentColor' : 'none'"
    />
  </button>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Heart } from 'lucide-vue-next'
  import type { Show } from '@/types'
  import { useFavoritesStore } from '@/features/favorites/store/favorites'

  const props = defineProps<{
    show: Show
    size?: 'sm' | 'lg'
    alwaysVisible?: boolean
  }>()

  const favStore = useFavoritesStore()
  const heartHovered = ref(false)

  const isFav = computed(() => favStore.isFavorite(props.show.id))
  const heartColor = computed(() =>
    isFav.value || heartHovered.value ? 'text-accent' : 'text-white/70'
  )

  const sizeClasses = computed(() => (props.size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'))
  const iconSizeClass = computed(() => (props.size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'))
</script>
