import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { useShowStore } from '@/features/shows/store/shows'
import HomeView from '@/features/shows/views/HomeView.vue'

function createWrapper() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/browse', name: 'browse', component: { template: '<div/>' } },
      { path: '/show/:id', component: { template: '<div/>' } },
    ],
  })

  const wrapper = mount(HomeView, {
    global: {
      plugins: [router, createTestingPinia({ stubActions: true })],
    },
  })

  return { wrapper, router }
}

describe('HomeView', () => {
  it('"See All" links to browse with the correct genre param', async () => {
    const { wrapper } = createWrapper()
    const store = useShowStore()

    store.genres = ['Drama', 'Action']
    store.getGenreShows = (genre: string) =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `Show ${i + 1}`,
        genres: [genre],
        rating: { average: 8 - i },
        image: null,
      }))

    await flushPromises()

    const links = wrapper.findAll('a').filter((a) => a.text().includes('See All'))
    expect(links[0]!.attributes('href')).toBe('/browse?genre=Drama')
    expect(links[1]!.attributes('href')).toBe('/browse?genre=Action')
  })
})
