<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { session } from './session'
import { api } from './services/api'

const router = useRouter()
const online = ref(navigator.onLine)
const updateOnline = () => (online.value = navigator.onLine)

onMounted(() => {
  window.addEventListener('online', updateOnline)
  window.addEventListener('offline', updateOnline)
})
onUnmounted(() => {
  window.removeEventListener('online', updateOnline)
  window.removeEventListener('offline', updateOnline)
})

// Si la sesión se pierde (logout o 401), se vuelve al inicio de sesión.
watch(() => session.user, user => { if (!user) router.push('/login') })

async function logout() {
  try { await api.logout() } catch { /* la sesión local se cierra igualmente */ }
  session.user = null
}
</script>

<template>
  <header class="top">
    <RouterLink to="/" class="brand">✔ Mis tareas</RouterLink>
    <nav v-if="session.user">
      <span class="user">{{ session.user.username }}</span>
      <button class="ghost" @click="logout">Salir</button>
    </nav>
  </header>
  <p v-if="!online || session.offline" class="banner" role="status">
    Sin conexión. Se muestra solo la aplicación; las tareas no se guardan sin red.
  </p>
  <main><RouterView /></main>
</template>
