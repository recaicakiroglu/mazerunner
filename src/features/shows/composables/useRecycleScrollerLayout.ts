import { ref, computed, onMounted, onUnmounted } from 'vue'

// RecycleScroller requires a fixed pixel row height — it cannot measure rows itself.
// itemSize derives height from the card's 210/295 aspect ratio (TVMaze medium portrait) + 104px info bar, accounting for gaps.
export function useRecycleScrollerLayout() {
  const winWidth = ref(window.innerWidth)

  const breakpoints = [
    { minWidth: 1280, cols: 5 },
    { minWidth: 768, cols: 4 },
    { minWidth: 640, cols: 3 },
  ]

  const colCount = computed(
    () => breakpoints.find((bp) => winWidth.value >= bp.minWidth)?.cols ?? 2
  )

  const itemSize = computed(() => {
    const contentW = Math.min(winWidth.value - 32, 1248) - 16
    const cardW = (contentW - (colCount.value - 1) * 24) / colCount.value
    return Math.round((cardW * 295) / 210) + 104
  })

  function onResize() {
    winWidth.value = window.innerWidth
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  return { colCount, itemSize }
}
