import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFavoritesStore } from '@/features/favorites/store/favorites'
import type { Show } from '@/types'

function makeShow(overrides: Partial<Show> & { id: number }): Show {
  return {
    name: 'Test Show',
    genres: ['Drama'],
    rating: { average: 8.0 },
    image: null,
    ...overrides,
  }
}

describe('useFavoritesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('starts with no favorites', () => {
    const store = useFavoritesStore()
    expect(store.favorites).toHaveLength(0)
  })

  it('toggle adds a show to favorites', () => {
    const store = useFavoritesStore()
    const show = makeShow({ id: 1 })

    store.toggle(show)

    expect(store.favorites).toHaveLength(1)
    expect(store.isFavorite(1)).toBe(true)
  })

  it('toggle removes a show that is already favorited', () => {
    const store = useFavoritesStore()
    const show = makeShow({ id: 1 })

    store.toggle(show)
    store.toggle(show)

    expect(store.favorites).toHaveLength(0)
    expect(store.isFavorite(1)).toBe(false)
  })

  it('isFavorite returns false for shows not in favorites', () => {
    const store = useFavoritesStore()
    expect(store.isFavorite(999)).toBe(false)
  })

  it('persists favorites to localStorage on toggle', () => {
    const store = useFavoritesStore()
    store.toggle(makeShow({ id: 1, name: 'Persisted Show' }))

    const saved = JSON.parse(localStorage.getItem('tv-favorites')!)
    expect(saved).toHaveLength(1)
    expect(saved[0].name).toBe('Persisted Show')
  })

  it('loads favorites from localStorage on init', () => {
    const show = makeShow({ id: 42, name: 'Stored Show' })
    localStorage.setItem('tv-favorites', JSON.stringify([show]))

    setActivePinia(createPinia())
    const store = useFavoritesStore()

    expect(store.favorites).toHaveLength(1)
    expect(store.isFavorite(42)).toBe(true)
  })

  it('starts empty when localStorage contains invalid data', () => {
    localStorage.setItem('tv-favorites', 'not valid json{{{')

    setActivePinia(createPinia())
    const store = useFavoritesStore()

    expect(store.favorites).toHaveLength(0)
  })
})
