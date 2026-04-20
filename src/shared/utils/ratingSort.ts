import type { Show } from '@/types'

export function ratingSort(a: Show, b: Show): number {
  const rA = a.rating.average,
    rB = b.rating.average
  if (rA === null && rB === null) {return 0}
  if (rA === null) {return 1}
  if (rB === null) {return -1}
  return rB - rA
}
