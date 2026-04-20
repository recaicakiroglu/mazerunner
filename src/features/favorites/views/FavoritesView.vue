<template>
  <div>
    <h1 class="text-[1.3rem] font-semibold mb-8 text-text-secondary">
      My <span class="text-text-primary">Favorites</span>
      <span class="ml-2 text-base font-normal text-text-muted">({{ favorites.length }})</span>
    </h1>

    <p v-if="favorites.length === 0" class="text-center py-24 text-text-muted text-base">
      No favorites yet — click the ♥ on any show to save it here.
    </p>

    <ShowGrid v-else :shows="sorted" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useFavoritesStore } from '@/features/favorites/store/favorites'
  import ShowGrid from '@/features/shows/components/ShowGrid.vue'
  import { ratingSort } from '@/shared/utils/ratingSort'

  const { favorites } = storeToRefs(useFavoritesStore())

  const sorted = computed(() => [...favorites.value].sort(ratingSort))
</script>
