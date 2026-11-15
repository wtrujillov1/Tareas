<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { session } from '../session'

const router = useRouter()
const mode = ref('login') // login | register
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const call = mode.value === 'login' ? api.login : api.register
    session.user = await call({ username: form.username.trim(), password: form.password })
    session.offline = false
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="card narrow">
    <h1>{{ mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta' }}</h1>
    <form @submit.prevent="submit">
      <label>Usuario
        <input v-model="form.username" required minlength="3" maxlength="40" pattern="[A-Za-z0-9_]+" autocomplete="username" />
      </label>
      <label>Contraseña
        <input v-model="form.password" type="password" required minlength="8" maxlength="128"
               :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" />
      </label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button :disabled="loading">{{ loading ? 'Enviando…' : mode === 'login' ? 'Entrar' : 'Registrarme' }}</button>
    </form>
    <button class="link" type="button" @click="mode = mode === 'login' ? 'register' : 'login'; error = ''">
      {{ mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
    </button>
  </section>
</template>
