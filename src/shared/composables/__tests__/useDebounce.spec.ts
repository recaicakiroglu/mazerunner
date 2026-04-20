import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useDebounce } from '@/shared/composables/useDebounce'

// Mount inside a component so Vue lifecycle (onUnmounted) works correctly
function mountDebounce(fn: (...args: unknown[]) => void, delay: number) {
  const debounced = { fn: null as ((...args: unknown[]) => void) | null }

  const Wrapper = defineComponent({
    setup() {
      debounced.fn = useDebounce(fn, delay)
      return {}
    },
    template: '<div/>',
  })

  const wrapper = mount(Wrapper)
  return { debounced: debounced.fn!, wrapper }
}

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not call the function before the delay', () => {
    const fn = vi.fn()
    const { debounced } = mountDebounce(fn, 300)

    debounced('hello')
    vi.advanceTimersByTime(200)

    expect(fn).not.toHaveBeenCalled()
  })

  it('calls the function after the delay', () => {
    const fn = vi.fn()
    const { debounced } = mountDebounce(fn, 300)

    debounced('hello')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('hello')
  })

  it('resets the timer on repeated calls (cancels previous)', () => {
    const fn = vi.fn()
    const { debounced } = mountDebounce(fn, 300)

    debounced('first')
    vi.advanceTimersByTime(200)
    debounced('second')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('second')
  })

  it('cleans up the timer on component unmount', () => {
    const fn = vi.fn()
    const { debounced, wrapper } = mountDebounce(fn, 300)

    debounced('pending')
    wrapper.unmount()
    vi.advanceTimersByTime(300)

    expect(fn).not.toHaveBeenCalled()
  })
})
