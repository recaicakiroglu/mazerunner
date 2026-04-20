import { ref, watch, onUnmounted } from 'vue'

// recheckSentinel must be called after new items are appended — the observer won't re-fire
// if the sentinel is still visible, so we force a re-observe cycle to trigger the next load.
export function useInfiniteScroll(onLoadMore: () => void) {
  const sentinelEl = ref<HTMLElement | null>(null)

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        onLoadMore()
      }
    },
    { rootMargin: '200px' }
  )

  watch(sentinelEl, (el, prev) => {
    if (prev) {
      observer.unobserve(prev)
    }
    if (el) {
      observer.observe(el)
    }
  })

  function recheckSentinel() {
    const el = sentinelEl.value
    if (!el) {
      return
    }
    const rect = el.getBoundingClientRect()
    if (rect.top > window.innerHeight + 200) {
      return
    }
    observer.unobserve(el)
    observer.observe(el)
  }

  onUnmounted(() => observer.disconnect())

  return { sentinelEl, recheckSentinel }
}
