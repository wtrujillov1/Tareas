<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useTasks } from '../composables/useTasks'
import TaskForm from '../components/TaskForm.vue'
import TaskItem from '../components/TaskItem.vue'

const { tasks, status, error, notice, actionError, busy, load, create, update, remove, listen, stop } = useTasks()

const filter = ref('all')
const editing = ref(null)
const formOpen = ref(false)

const visible = computed(() => filter.value === 'all' ? tasks.value : tasks.value.filter(t => t.status === filter.value))

onMounted(() => { load(); listen() })
onBeforeUnmount(stop)

function openForm(task = null) {
  editing.value = task
  formOpen.value = true
}

async function save(data) {
  const ok = editing.value ? await update(editing.value, data) : await create(data)
  if (ok) formOpen.value = false
}

function toggle(task) {
  update(task, { status: task.status === 'completed' ? 'pending' : 'completed' })
}

function confirmRemove(task) {
  if (window.confirm(`¿Eliminar «${task.title}»?`)) remove(task)
}
</script>

<template>
  <section>
    <div class="row between">
      <h1>Tareas</h1>
      <div class="row">
        <select v-model="filter" aria-label="Filtrar por estado">
          <option value="all">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="in_progress">En curso</option>
          <option value="completed">Completadas</option>
        </select>
        <button @click="openForm()">+ Nueva</button>
      </div>
    </div>

    <p v-if="notice" class="success" role="status">{{ notice }}</p>
    <p v-if="actionError" class="error" role="alert">{{ actionError }}</p>

    <TaskForm v-if="formOpen" :task="editing" :busy="busy" @submit="save" @cancel="formOpen = false" />

    <p v-if="status === 'loading'" class="state">Cargando tareas…</p>
    <div v-else-if="status === 'error'" class="state error" role="alert">
      <p>{{ error }}</p>
      <button @click="load">Reintentar</button>
    </div>
    <p v-else-if="!visible.length" class="state">
      {{ tasks.length ? 'No hay tareas con ese estado.' : 'Aún no tienes tareas. Crea la primera.' }}
    </p>
    <ul v-else class="list">
      <TaskItem v-for="task in visible" :key="task.id" :task="task" :busy="busy"
                @edit="openForm" @remove="confirmRemove" @toggle="toggle" />
    </ul>
  </section>
</template>
