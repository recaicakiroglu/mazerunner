<template>
  <div>
    <LoadingSpinner v-if="loading" />

    <p v-else-if="!genreRows.length" class="text-center py-24 text-text-muted">
      No shows available.
    </p>

    <template v-else>
      <section v-for="{ genre, shows } in genreRows" :key="genre" class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[1.1rem] font-semibold text-text-primary">{{ genre }}</h2>
          <BaseButton :to="{ name: 'browse', query: { genre } }">See All →</BaseButton>
        </div>

        <ShowGrid :shows="shows" />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useShowStore } from '@/features/shows/store/shows'
  import ShowGrid from '@/features/shows/components/ShowGrid.vue'
  import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
  import BaseButton from '@/shared/components/BaseButton.vue'
  import { ratingSort } from '@/shared/utils/ratingSort'
  import { useErrorToast } from '@/shared/composables/useErrorToast'

  const store = useShowStore()
  const { genres, loading, error } = storeToRefs(store)

  useErrorToast(error)

  const genreRows = computed(() =>
    genres.value
      .map((genre) => ({ genre, shows: store.getGenreShows(genre).sort(ratingSort).slice(0, 5) }))
      .filter((row) => row.shows.length >= 5)
  )

  onMounted(() => store.load())
</script>
