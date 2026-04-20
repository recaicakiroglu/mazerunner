import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ShowDetail from '@/features/shows/components/ShowDetail.vue'
import type { ShowDetail as ShowDetailType, CastMember } from '@/types'

const mockShow: ShowDetailType = {
  id: 1,
  name: 'Breaking Bad',
  genres: ['Drama', 'Crime'],
  rating: { average: 9.5 },
  image: null,
  summary: 'A chemistry teacher turned drug lord.',
  status: 'Ended',
  language: 'English',
  runtime: 60,
  premiered: '2008-01-20',
  ended: '2013-09-29',
  officialSite: null,
  schedule: { time: '21:00', days: ['Sunday'] },
  network: { name: 'AMC', country: { name: 'United States' } },
  webChannel: null,
}

const mockCast: CastMember[] = [
  {
    person: { id: 10, name: 'Bryan Cranston', image: null },
    character: { id: 20, name: 'Walter White' },
  },
]

function createWrapper(cast: CastMember[] = []) {
  return mount(ShowDetail, {
    props: { show: mockShow, cast },
    global: { plugins: [createTestingPinia()] },
  })
}

describe('ShowDetail', () => {
  it('shows Overview tab content by default', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('A chemistry teacher turned drug lord.')
  })

  it('switches to Cast tab and shows cast members', async () => {
    const wrapper = createWrapper(mockCast)

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cast')!
      .trigger('click')

    expect(wrapper.text()).toContain('Bryan Cranston')
    expect(wrapper.text()).toContain('Walter White')
    expect(wrapper.text()).not.toContain('A chemistry teacher')
  })

  it('switches to Details tab and shows metadata', async () => {
    const wrapper = createWrapper()

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Details')!
      .trigger('click')

    expect(wrapper.text()).toContain('AMC')
    expect(wrapper.text()).not.toContain('A chemistry teacher')
  })

  it('shows empty cast message when no cast provided', async () => {
    const wrapper = createWrapper([])

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cast')!
      .trigger('click')

    expect(wrapper.text()).toContain('No cast information available')
  })

  it('shows show title and rating', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Breaking Bad')
    expect(wrapper.text()).toContain('9.5')
  })
})
