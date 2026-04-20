<template>
  <AppHeader />
  <main class="max-w-7xl mx-auto px-4 py-8">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.name" />
      </Transition>
    </RouterView>
  </main>
</template>

<script setup lang="ts">
  import AppHeader from '@/shared/components/AppHeader.vue'
</script>
