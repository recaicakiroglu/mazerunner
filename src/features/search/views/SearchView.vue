<template>
  <div>
    <h1 v-if="route.query.q" class="text-[1.3rem] font-semibold mb-8 text-text-secondary">
      Results for <span class="text-text-primary">"{{ route.query.q }}"</span>
    </h1>

    <Transition name="fade" mode="out-in">
      <LoadingSpinner v-if="loading" key="loading">Searching...</LoadingSpinner>

      <p v-else-if="error" key="error" class="text-center py-12 text-text-muted text-base">
        {{ error }}
      </p>

      <p
        v-else-if="results.length === 0 && route.query.q"
        key="empty"
        class="text-center py-12 text-text-muted text-base"
      >
        No results found for "{{ route.query.q }}"
      </p>

      <ShowGrid v-else key="results" :shows="results" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { searchShows } from '@/api/tvmaze'
  import { ratingSort } from '@/shared/utils/ratingSort'
  import ShowGrid from '@/features/shows/components/ShowGrid.vue'
  import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
  import type { Show } from '@/types'

  const route = useRoute()

  const results = ref<Show[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function doSearch(q: string) {
    if (!q.trim()) {
      results.value = []
      return
    }

    loading.value = true
    error.value = null

    const currentQuery = q

    try {
      const data = await searchShows(q)
      if (route.query.q === currentQuery) {
        results.value = data.sort(ratingSort)
      }
    } catch (e) {
      if (route.query.q === currentQuery) {
        error.value = e instanceof Error ? e.message : 'Search failed'
      }
    } finally {
      if (route.query.q === currentQuery) {
        loading.value = false
      }
    }
  }

  watch(
    () => route.query.q as string,
    (q) => doSearch(q ?? ''),
    { immediate: true }
  )
</script>
