declare module 'vue-virtual-scroller' {
  import type { DefineComponent } from 'vue'

  export const RecycleScroller: DefineComponent<{
    items: unknown[]
    itemSize: number
    keyField?: string
    pageMode?: boolean
    buffer?: number
  }>

  export const DynamicScroller: DefineComponent<{
    items: unknown[]
    minItemSize: number
    keyField?: string
    pageMode?: boolean
    buffer?: number
  }>

  export const DynamicScrollerItem: DefineComponent<{
    item: unknown
    active: boolean
    sizeDependencies?: unknown[]
  }>
}
