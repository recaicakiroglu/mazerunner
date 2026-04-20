<template>
  <Transition name="fade">
    <nav
      v-if="showMenu"
      id="mobile-nav"
      class="md:hidden px-4 pb-4 flex flex-col gap-3 border-t border-white/6 pt-3"
    >
      <SearchInput
        class="w-full"
        :model-value="query"
        @update:model-value="onSearchInput"
        @keydown.enter="onSubmit"
      />

      <!-- Genres accordion -->
      <div>
        <button
          class="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors w-full cursor-pointer"
          :aria-expanded="genresOpen"
          aria-controls="mobile-genres"
          @click="genresOpen = !genresOpen"
        >
          Genres
          <ChevronDown
            aria-hidden="true"
            class="w-3.5 h-3.5 transition-transform duration-150 ml-auto"
            :class="chevronClass"
          />
        </button>

        <Transition name="dropdown">
          <div v-if="genresOpen" id="mobile-genres" class="mt-3 flex flex-wrap gap-2">
            <RouterLink
              v-for="genre in genres"
              :key="genre"
              :to="{ name: 'browse', query: { genre } }"
              class="px-3 py-1 rounded-full bg-white/8 text-sm text-text-secondary hover:bg-white/14 hover:text-text-primary transition-colors"
              @click="$emit('close-menu')"
              >{{ genre }}</RouterLink
            >
          </div>
        </Transition>
      </div>

      <div class="h-px bg-white/8" />

      <RouterLink
        to="/favorites"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors"
        @click="$emit('close-menu')"
        >Favorites</RouterLink
      >
    </nav>
  </Transition>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ChevronDown } from 'lucide-vue-next'
  import SearchInput from '@/shared/components/SearchInput.vue'

  defineProps<{
    showMenu: boolean
    query: string
    genres: string[]
    onSearchInput: (val: string) => void
    onSubmit: () => void
  }>()

  defineEmits<{ 'close-menu': [] }>()

  const genresOpen = ref(false)
  const chevronClass = computed(() => (genresOpen.value ? 'rotate-180' : ''))
</script>
