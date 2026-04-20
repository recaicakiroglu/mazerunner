import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import SearchView from '@/features/search/views/SearchView.vue'

vi.mock('@/api/tvmaze', () => ({
  searchShows: vi.fn(),
}))

import { searchShows } from '@/api/tvmaze'

async function createWrapper(query: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/search', component: SearchView }],
  })

  await router.push({ path: '/search', query: { q: query } })

  const wrapper = mount(SearchView, {
    global: { plugins: [router, createPinia()] },
  })

  await flushPromises()
  return wrapper
}

afterEach(() => vi.clearAllMocks())

describe('SearchView', () => {
  it('displays search results when API returns shows', async () => {
    vi.mocked(searchShows).mockResolvedValue([
      { id: 1, name: 'Breaking Bad', genres: ['Drama'], rating: { average: 9.5 }, image: null },
    ])

    const wrapper = await createWrapper('breaking bad')

    expect(wrapper.text()).toContain('Breaking Bad')
  })

  it('shows empty state when no results found', async () => {
    vi.mocked(searchShows).mockResolvedValue([])

    const wrapper = await createWrapper('xyznotfound')

    expect(wrapper.text()).toContain('No results found')
  })

  it('shows error message when search fails', async () => {
    vi.mocked(searchShows).mockRejectedValue(new Error('Network error'))

    const wrapper = await createWrapper('test')

    expect(wrapper.text()).toContain('Network error')
  })
})
