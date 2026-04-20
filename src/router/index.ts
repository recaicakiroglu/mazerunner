import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/features/shows/views/HomeView.vue'),
    },
    {
      path: '/browse',
      name: 'browse',
      component: () => import('@/features/shows/views/BrowseView.vue'),
    },
    {
      path: '/show/:id',
      name: 'detail',
      component: () => import('@/features/shows/views/DetailView.vue'),
      props: true,
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/features/search/views/SearchView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/features/favorites/views/FavoritesView.vue'),
    },
  ],
})

export default router
