import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { useFavoritesStore } from '@/features/favorites/store/favorites'
import ShowCard from '@/features/shows/components/ShowCard.vue'
import type { Show } from '@/types'

function makeShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 1,
    name: 'Test Show',
    genres: ['Drama'],
    rating: { average: 8.5 },
    image: {
      medium: 'https://example.com/medium.jpg',
      original: 'https://example.com/original.jpg',
    },
    ...overrides,
  }
}

function createWrapper(show: Show) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/show/:id', component: { template: '<div/>' } },
    ],
  })

  return mount(ShowCard, {
    props: { show },
    global: { plugins: [router, createTestingPinia({ stubActions: false })] },
  })
}

describe('ShowCard', () => {
  it('renders the show name', () => {
    const wrapper = createWrapper(makeShow({ name: 'Breaking Bad' }))
    expect(wrapper.text()).toContain('Breaking Bad')
  })

  it('renders the rating when available', () => {
    const wrapper = createWrapper(makeShow({ rating: { average: 9.5 } }))
    expect(wrapper.text()).toContain('9.5')
  })

  it('renders "N/A" when rating is null', () => {
    const wrapper = createWrapper(makeShow({ rating: { average: null } }))
    expect(wrapper.text()).toContain('N/A')
  })

  it('renders poster image when image is available', () => {
    const wrapper = createWrapper(makeShow())
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/medium.jpg')
  })

  it('renders placeholder when image is null', () => {
    const wrapper = createWrapper(makeShow({ image: null }))
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('[data-testid="poster-placeholder"]').exists()).toBe(true)
  })

  it('card is a link pointing to the show detail page', () => {
    const wrapper = createWrapper(makeShow({ id: 42 }))
    expect(wrapper.find('a').attributes('href')).toBe('/show/42')
  })

  it('clicking the heart button toggles favorite', async () => {
    const show = makeShow({ id: 1 })
    const wrapper = createWrapper(show)
    const favStore = useFavoritesStore()

    expect(favStore.isFavorite(1)).toBe(false)

    await wrapper.find('button[aria-label="Add to favorites"]').trigger('click')
    expect(favStore.isFavorite(1)).toBe(true)

    await wrapper.find('button[aria-label="Remove from favorites"]').trigger('click')
    expect(favStore.isFavorite(1)).toBe(false)
  })
})
