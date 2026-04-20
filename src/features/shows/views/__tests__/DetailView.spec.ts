import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { useShowStore } from '@/features/shows/store/shows'
import DetailView from '@/features/shows/views/DetailView.vue'

vi.mock('@/api/tvmaze', () => ({
  getShowCast: vi.fn().mockResolvedValue([]),
}))

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

async function createWrapper() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/show/:id', component: DetailView, props: true },
    ],
  })
  await router.push('/show/1')

  const wrapper = mount(DetailView, {
    props: { id: '1' },
    global: {
      plugins: [router, createTestingPinia({ stubActions: true })],
    },
  })

  const store = useShowStore()
  store.getShowById = vi.fn().mockResolvedValue(null)
  await flushPromises()

  return { wrapper, router }
}

describe('DetailView — back button', () => {
  it('calls router.back() when browser history exists', async () => {
    vi.stubGlobal('history', { length: 2, back: vi.fn(), go: vi.fn() })
    const { wrapper, router } = await createWrapper()
    const backSpy = vi.spyOn(router, 'back').mockImplementation(() => {})

    await wrapper.find('button').trigger('click')

    expect(backSpy).toHaveBeenCalled()
  })

  it('navigates to home when no browser history', async () => {
    vi.stubGlobal('history', { length: 1, back: vi.fn(), go: vi.fn() })
    const { wrapper, router } = await createWrapper()
    const pushSpy = vi.spyOn(router, 'push').mockImplementation(async () => {})

    await wrapper.find('button').trigger('click')

    expect(pushSpy).toHaveBeenCalledWith('/')
  })
})
