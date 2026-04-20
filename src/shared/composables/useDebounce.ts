import { onUnmounted } from 'vue'

export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => fn(...args), delay)
  }

  onUnmounted(() => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  })

  return debounced
}
