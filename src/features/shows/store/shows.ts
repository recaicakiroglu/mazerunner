import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { Show, ShowDetail } from '@/types'
import { fetchShowsPage, getShowById as fetchShowById } from '@/api/tvmaze'
import { ratingSort } from '@/shared/utils/ratingSort'
import { INITIAL_PAGES, LOAD_MORE_PAGES, LOAD_MORE_MIN_MS } from '@/config'

interface GenreData {
  rated: Show[]
  unrated: Show[]
  ids: Set<number>
}

export const useShowStore = defineStore('shows', () => {
  const genreMap = new Map<string, GenreData>()

  const genres = ref<string[]>([])
  const activeGenre = ref('')
  const activeShows = shallowRef<Show[]>([])

  const loading = ref(false)
  const hasMore = ref(true)

  const error = ref<string | null>(null)

  const currentPage = ref(0)

  function addShow(show: Show, genre: string) {
    if (!genreMap.has(genre)) {
      genres.value.push(genre)
      genres.value.sort()
      genreMap.set(genre, { rated: [], unrated: [], ids: new Set() })
    }
    const data = genreMap.get(genre)!
    if (data.ids.has(show.id)) {
      return
    }
    data.ids.add(show.id)
    if (show.rating.average !== null) {
      data.rated.push(show)
    } else {
      data.unrated.push(show)
    }
  }

  function setActiveGenre(genre: string) {
    if (activeGenre.value === genre) {
      return
    }
    activeGenre.value = genre
    genreMap.get(genre)?.rated.sort(ratingSort)
    const data = genreMap.get(genre)
    activeShows.value = data ? [...data.rated, ...data.unrated] : []
    hasMore.value = true
  }

  async function loadInitial() {
    if (loading.value) {
      return
    }
    loading.value = true
    error.value = null
    const pages = await Promise.all(
      Array.from({ length: INITIAL_PAGES }, (_, i) => fetchShowsPage(i).catch(() => []))
    )
    pages.flat().forEach((show) => show.genres.forEach((genre) => addShow(show, genre)))
    currentPage.value = INITIAL_PAGES
    if (!genres.value.length) {
      error.value = 'Failed to load shows. Please try again.'
    }
    loading.value = false
  }

  async function loadMore() {
    const genre = activeGenre.value
    if (loading.value || !hasMore.value || !genre) {
      return
    }
    loading.value = true
    const t0 = Date.now()

    const pages = await Promise.all(
      Array.from({ length: LOAD_MORE_PAGES }, (_, i) =>
        fetchShowsPage(currentPage.value + i).catch(() => [])
      )
    )
    const allShows = pages.flat()
    if (allShows.length === 0) {
      hasMore.value = false
    } else {
      allShows.forEach((show) => show.genres.forEach((g) => addShow(show, g)))
      currentPage.value += LOAD_MORE_PAGES
      const data = genreMap.get(genre)
      if (data) {
        data.rated.sort(ratingSort)
        activeShows.value = [...data.rated, ...data.unrated]
      }
    }

    const wait = LOAD_MORE_MIN_MS - (Date.now() - t0)
    if (wait > 0) {
      await new Promise((r) => setTimeout(r, wait))
    }
    loading.value = false
  }

  async function load() {
    if (genreMap.size === 0) {
      await loadInitial()
    } else {
      await loadMore()
    }
  }

  function getGenreShows(genre: string): Show[] {
    const data = genreMap.get(genre)
    return data ? [...data.rated, ...data.unrated] : []
  }

  async function getShowById(id: number): Promise<ShowDetail | null> {
    try {
      return await fetchShowById(id)
    } catch {
      return null
    }
  }

  return {
    genres,
    activeShows,
    loading,
    hasMore,
    error,
    load,
    getShowById,
    getGenreShows,
    setActiveGenre,
  }
})
