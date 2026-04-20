import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.use(Vue3Toastify, {
  autoClose: 4000,
  theme: 'dark',
  position: 'bottom-center',
} as ToastContainerOptions)

app.mount('#app')
