import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShowStore } from '@/features/shows/store/shows'
import type { ShowDetail } from '@/types'

vi.mock('@/api/tvmaze', () => ({
  fetchShowsPage: vi.fn(),
  getShowById: vi.fn(),
}))

import { fetchShowsPage } from '@/api/tvmaze'

function makeShow(overrides: Partial<ShowDetail> & { id: number; name: string }): ShowDetail {
  return {
    genres: [],
    rating: { average: null },
    image: null,
    summary: null,
    status: 'Ended',
    language: 'English',
    runtime: 60,
    premiered: '2010-01-01',
    ended: null,
    officialSite: null,
    schedule: { time: '21:00', days: ['Monday'] },
    network: null,
    webChannel: null,
    ...overrides,
  }
}

describe('useShowStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('skips shows with no genres', async () => {
    vi.mocked(fetchShowsPage)
      .mockResolvedValueOnce([
        makeShow({ id: 1, name: 'No Genre Show', genres: [] }),
        makeShow({ id: 2, name: 'Drama Show', genres: ['Drama'] }),
      ])
      .mockResolvedValue([])
    const store = useShowStore()
    await store.load()

    expect(store.genres).toHaveLength(1)
    expect(store.genres[0]).toBe('Drama')
  })

  it('places a show in multiple genres when it has multiple genres', async () => {
    vi.mocked(fetchShowsPage)
      .mockResolvedValueOnce([
        makeShow({ id: 1, name: 'Breaking Bad', genres: ['Drama', 'Crime'] }),
      ])
      .mockResolvedValue([])
    const store = useShowStore()
    await store.load()

    expect(store.genres).toContain('Drama')
    expect(store.genres).toContain('Crime')
  })

  it('sorts shows by rating descending, unrated shows last', async () => {
    vi.mocked(fetchShowsPage)
      .mockResolvedValueOnce([
        makeShow({ id: 1, name: 'Low Rated', genres: ['Drama'], rating: { average: 5.0 } }),
        makeShow({ id: 2, name: 'High Rated', genres: ['Drama'], rating: { average: 9.2 } }),
        makeShow({ id: 3, name: 'No Rating', genres: ['Drama'], rating: { average: null } }),
        makeShow({ id: 4, name: 'Mid Rated', genres: ['Drama'], rating: { average: 7.5 } }),
      ])
      .mockResolvedValue([])
    const store = useShowStore()
    await store.load()
    store.setActiveGenre('Drama')

    expect(store.activeShows[0]!.name).toBe('High Rated')
    expect(store.activeShows[1]!.name).toBe('Mid Rated')
    expect(store.activeShows[2]!.name).toBe('Low Rated')
    expect(store.activeShows[3]!.name).toBe('No Rating')
  })

  it('sorts genre list alphabetically', async () => {
    vi.mocked(fetchShowsPage)
      .mockResolvedValueOnce([
        makeShow({ id: 1, name: 'Action Show', genres: ['Action'], rating: { average: 6.0 } }),
        makeShow({ id: 2, name: 'Drama Show', genres: ['Drama'], rating: { average: 9.0 } }),
      ])
      .mockResolvedValue([])
    const store = useShowStore()
    await store.load()

    expect(store.genres[0]).toBe('Action')
    expect(store.genres[1]).toBe('Drama')
  })
})
