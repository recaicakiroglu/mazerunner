import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounce } from '@/shared/composables/useDebounce'
import { SEARCH_DEBOUNCE_MS } from '@/config'

export function useHeaderSearch() {
  const route = useRoute()
  const router = useRouter()

  const query = ref((route.query.q as string) ?? '')

  watch(
    () => route.query.q,
    (q) => {
      query.value = (q as string) ?? ''
    }
  )

  const navigate = useDebounce((q: string) => {
    if (q.trim()) {
      router.push({ name: 'search', query: { q: q.trim() } })
    } else {
      router.push({ name: 'home' })
    }
  }, SEARCH_DEBOUNCE_MS)

  function onSearchInput(val: string) {
    query.value = val
    navigate(val)
  }

  function onSubmit() {
    if (query.value.trim()) {
      router.push({ name: 'search', query: { q: query.value.trim() } })
    }
  }

  return { query, onSearchInput, onSubmit }
}
