<script setup>
defineProps({ task: { type: Object, required: true }, busy: Boolean })
defineEmits(['edit', 'remove', 'toggle'])

const labels = { pending: 'Pendiente', in_progress: 'En curso', completed: 'Completada' }
</script>

<template>
  <li class="task" :class="task.status">
    <div class="info">
      <strong>{{ task.title }}</strong>
      <span class="tag">{{ labels[task.status] }}</span>
      <p v-if="task.description">{{ task.description }}</p>
    </div>
    <div class="row">
      <button class="ghost" :disabled="busy" @click="$emit('toggle', task)">
        {{ task.status === 'completed' ? 'Reabrir' : 'Completar' }}
      </button>
      <button class="ghost" :disabled="busy" @click="$emit('edit', task)">Editar</button>
      <button class="danger" :disabled="busy" @click="$emit('remove', task)">Eliminar</button>
    </div>
  </li>
</template>
