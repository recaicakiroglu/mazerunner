import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Show } from '@/types'
import { FAVORITES_STORAGE_KEY } from '@/config'

function loadFromStorage(): Show[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const list = ref<Show[]>(loadFromStorage())
  const ids = computed(() => new Set(list.value.map((s) => s.id)))

  function persist() {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list.value))
  }

  function toggle(show: Show) {
    if (ids.value.has(show.id)) {
      list.value = list.value.filter((s) => s.id !== show.id)
    } else {
      list.value = [...list.value, show]
    }
    persist()
  }

  function isFavorite(id: number) {
    return ids.value.has(id)
  }

  return { favorites: list, isFavorite, toggle }
})
