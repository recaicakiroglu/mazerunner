<template>
  <div>
    <h2 class="text-[1.1rem] font-semibold text-text-secondary mb-6">
      {{ selectedGenre }}
    </h2>

    <!-- Virtual grid -->
    <Transition name="fade" mode="out-in">
      <div
        :key="selectedGenre"
        :style="{
          opacity: loading && activeShows.length ? 0.2 : 1,
          filter: loading && activeShows.length ? 'blur(2px)' : 'none',
          transition: loading ? 'none' : 'opacity 200ms ease, filter 200ms ease',
        }"
      >
        <p v-if="!rows.length && !hasMore" class="text-center py-24 text-text-muted">
          No shows found for this genre.
        </p>

        <RecycleScroller
          v-else-if="rows.length"
          :items="rows"
          :item-size="itemSize"
          key-field="id"
          page-mode
        >
          <template #default="{ item: row }">
            <div
              class="grid gap-6 px-2 pb-6 pt-2"
              :style="{ gridTemplateColumns: `repeat(${colCount},1fr)` }"
            >
              <ShowCard v-for="show in row.items" :key="show.id" :show="show" />
            </div>
          </template>
        </RecycleScroller>
      </div>
    </Transition>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinelEl" class="h-1" />

    <div
      v-if="loading"
      class="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <LoadingSpinner />
    </div>

    <p v-if="!hasMore" class="text-center text-text-muted text-sm py-8">
      All {{ activeShows.length }} shows loaded
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useRoute } from 'vue-router'
  import { useShowStore } from '@/features/shows/store/shows'
  import ShowCard from '@/features/shows/components/ShowCard.vue'
  import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
  import { useInfiniteScroll } from '@/features/shows/composables/useInfiniteScroll'
  import { useRecycleScrollerLayout } from '@/features/shows/composables/useRecycleScrollerLayout'
  import { useErrorToast } from '@/shared/composables/useErrorToast'
  import { RecycleScroller } from 'vue-virtual-scroller'
  import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
  import type { Show } from '@/types'

  const route = useRoute()
  const store = useShowStore()
  const { genres, activeShows, loading, hasMore, error } = storeToRefs(store)

  useErrorToast(error)

  const _selectedGenre = ref((route.query.genre as string) || '')

  const selectedGenre = computed({
    get: () => _selectedGenre.value || genres.value[0] || '',
    set: (v) => {
      _selectedGenre.value = v
    },
  })

  watch(
    () => route.query.genre,
    (genre) => {
      if (genre) {
        _selectedGenre.value = genre as string
      }
    }
  )

  watch(
    selectedGenre,
    (genre) => {
      if (genre) {
        store.setActiveGenre(genre)
      }
    },
    { immediate: true }
  )

  interface Row {
    id: number
    items: Show[]
  }

  const { colCount, itemSize } = useRecycleScrollerLayout()

  const rows = computed<Row[]>(() => {
    const cols = colCount.value
    const result: Row[] = []
    for (let i = 0; i < activeShows.value.length; i += cols) {
      const first = activeShows.value[i]
      if (first) {
        result.push({ id: first.id, items: activeShows.value.slice(i, i + cols) })
      }
    }
    return result
  })

  onMounted(() => store.load())

  const { sentinelEl, recheckSentinel } = useInfiniteScroll(() => {
    if (hasMore.value && !loading.value) {
      store.load()
    }
  })
  void sentinelEl

  watch(loading, (isLoading) => {
    if (!isLoading && hasMore.value) {
      recheckSentinel()
    }
  })
</script>
