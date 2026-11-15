<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  task: { type: Object, default: null }, // null = crear, objeto = editar
  busy: Boolean,
})
const emit = defineEmits(['submit', 'cancel'])

const form = reactive({ title: '', description: '', status: 'pending' })

watch(() => props.task, task => {
  form.title = task?.title ?? ''
  form.description = task?.description ?? ''
  form.status = task?.status ?? 'pending'
}, { immediate: true })

const send = () => emit('submit', { title: form.title.trim(), description: form.description, status: form.status })
</script>

<template>
  <form class="card" @submit.prevent="send">
    <h2>{{ task ? 'Editar tarea' : 'Nueva tarea' }}</h2>
    <label>Título
      <input v-model="form.title" required maxlength="120" />
    </label>
    <label>Descripción
      <textarea v-model="form.description" maxlength="2000" rows="3"></textarea>
    </label>
    <label>Estado
      <select v-model="form.status">
        <option value="pending">Pendiente</option>
        <option value="in_progress">En curso</option>
        <option value="completed">Completada</option>
      </select>
    </label>
    <div class="row">
      <button :disabled="busy">{{ busy ? 'Guardando…' : 'Guardar' }}</button>
      <button type="button" class="ghost" @click="emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
