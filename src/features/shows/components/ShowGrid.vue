<template>
  <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 list-none">
    <li v-for="show in shows" :key="show.id">
      <ShowCard :show="show" />
    </li>
  </ul>
</template>

<script setup lang="ts">
  import type { Show } from '@/types'
  import ShowCard from './ShowCard.vue'

  defineProps<{ shows: Show[] }>()
</script>
