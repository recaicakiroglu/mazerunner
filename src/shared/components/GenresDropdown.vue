<template>
  <div
    class="relative"
    @mouseenter="open"
    @mouseleave="scheduleClose"
    @keydown.escape="isOpen = false"
  >
    <button
      class="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 shrink-0 flex items-center gap-1 cursor-pointer"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      aria-controls="genres-dropdown"
      @focus="open"
      @blur="scheduleClose"
    >
      Genres
      <ChevronDown
        aria-hidden="true"
        class="w-3.5 h-3.5 transition-transform duration-150"
        :class="chevronClass"
      />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen && genres.length"
        id="genres-dropdown"
        class="absolute top-full left-0 mt-2 w-140 bg-bg-surface border border-white/10 rounded-xl shadow-2xl p-4"
      >
        <div class="grid grid-cols-4 gap-x-4 gap-y-1">
          <RouterLink
            v-for="genre in genres"
            :key="genre"
            :to="{ name: 'browse', query: { genre } }"
            class="text-sm text-text-secondary hover:text-text-primary transition-colors duration-100 py-0.5"
            @click="isOpen = false"
            >{{ genre }}</RouterLink
          >
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onBeforeUnmount } from 'vue'
  import { ChevronDown } from 'lucide-vue-next'

  defineProps<{ genres: string[] }>()

  const isOpen = ref(false)
  const chevronClass = computed(() => (isOpen.value ? 'rotate-180' : ''))
  let closeTimer: number | null = null

  function open() {
    if (closeTimer !== null) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    isOpen.value = true
  }

  function scheduleClose() {
    closeTimer = window.setTimeout(() => {
      isOpen.value = false
      closeTimer = null
    }, 300)
  }

  onBeforeUnmount(() => {
    if (closeTimer !== null) {
      clearTimeout(closeTimer)
    }
  })
</script>
