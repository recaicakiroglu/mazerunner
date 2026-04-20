<template>
  <header class="bg-bg-surface sticky top-0 z-100 border-b border-white/6">
    <div class="flex items-center gap-6 w-full max-w-7xl mx-auto px-4 py-2">
      <!-- Logo -->
      <RouterLink to="/" class="text-[1.7rem] font-bold text-accent whitespace-nowrap shrink-0"
        >MazeRunner</RouterLink
      >

      <!-- Desktop nav + search -->
      <div class="hidden md:flex flex-1 items-center justify-between gap-6">
        <div class="flex items-center gap-6">
          <div class="w-px h-5 bg-white/20 shrink-0" />
          <GenresDropdown :genres="genres" />
          <RouterLink
            to="/favorites"
            class="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 shrink-0"
          >
            Favorites</RouterLink
          >
        </div>

        <SearchInput
          class="w-80"
          :model-value="query"
          @update:model-value="onSearchInput"
          @keydown.enter="onSubmit"
        />
      </div>

      <!-- Mobile burger icon -->
      <button
        class="flex md:hidden items-center ml-auto text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        aria-label="Toggle menu"
        aria-controls="mobile-nav"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <Menu v-if="!menuOpen" aria-hidden="true" class="w-5 h-5" />
        <X v-else aria-hidden="true" class="w-5 h-5" />
      </button>
    </div>

    <!-- Mobile panel (outside flex row) -->
    <MobileNav
      :show-menu="menuOpen"
      :genres="genres"
      :query="query"
      :on-search-input="onSearchInput"
      :on-submit="onSubmit"
      @close-menu="menuOpen = false"
    />
  </header>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Menu, X } from 'lucide-vue-next'
  import { useShowStore } from '@/features/shows/store/shows'
  import { useHeaderSearch } from '@/shared/composables/useHeaderSearch'
  import GenresDropdown from '@/shared/components/GenresDropdown.vue'
  import MobileNav from '@/shared/components/MobileNav.vue'
  import SearchInput from '@/shared/components/SearchInput.vue'

  const { genres } = storeToRefs(useShowStore())
  const { query, onSearchInput, onSubmit } = useHeaderSearch()

  const menuOpen = ref(false)
</script>
