<template>
  <RouterLink
    :to="`/show/${show.id}`"
    :aria-label="`View details for ${show.name}`"
    class="block w-full transition-transform duration-150 hover:scale-105 group rounded-lg overflow-hidden bg-bg-surface"
  >
    <!-- Poster -->
    <div class="relative aspect-3/4">
      <img
        v-if="show.image"
        :src="show.image.medium"
        :alt="show.name"
        loading="lazy"
        class="w-full h-full object-cover object-top"
      />
      <div
        v-else
        data-testid="poster-placeholder"
        class="w-full h-full flex items-center justify-center p-4 text-center text-[0.85rem] text-text-secondary bg-linear-to-br from-bg-surface to-bg-surface-hover"
      >
        <span>{{ show.name }}</span>
      </div>

      <FavoriteButton :show="show" class="absolute top-2 left-2" />
    </div>

    <!-- Name + genres bar -->
    <div class="px-4 py-4 bg-bg-surface-hover">
      <div class="flex items-center justify-between gap-2">
        <p
          class="text-[0.85rem] font-semibold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {{ show.name }}
        </p>
        <RatingBadge :rating="show.rating.average" />
      </div>
      <div class="mt-2 flex gap-1 overflow-hidden min-h-5">
        <template v-if="show.genres.length">
          <span
            v-for="genre in visibleGenres"
            :key="genre"
            class="shrink-0 px-2 py-0.5 rounded-full bg-white/8 text-[0.68rem] text-text-secondary"
            >{{ genre }}</span
          >
          <span
            v-if="extraGenres"
            class="shrink-0 px-2 py-0.5 rounded-full bg-white/8 text-[0.68rem] text-text-muted"
            >+{{ extraGenres }}</span
          >
        </template>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Show } from '@/types'
  import RatingBadge from '@/shared/components/RatingBadge.vue'
  import FavoriteButton from '@/shared/components/FavoriteButton.vue'

  const props = defineProps<{ show: Show }>()

  const visibleGenres = computed(() => props.show.genres.slice(0, 2))
  const extraGenres = computed(() => Math.max(0, props.show.genres.length - 2))
</script>
