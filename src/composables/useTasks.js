import { ref } from 'vue'
import { api, EVENTS_URL } from '../services/api'
import { session } from '../session'

const EVENT_NAMES = ['task.created', 'task.updated', 'task.deleted']

export function useTasks() {
  const tasks = ref([])
  const status = ref('loading') // loading | ready | error
  const error = ref('')
  const notice = ref('')
  const actionError = ref('')
  const busy = ref(false)
  let controller = null
  let source = null

  // Si llega una carga nueva, se cancela la anterior: solo la última puede escribir el estado.
  async function load() {
    controller?.abort()
    const current = (controller = new AbortController())
    if (!tasks.value.length) status.value = 'loading'
    try {
      const data = await api.listTasks(current.signal)
      tasks.value = data
      status.value = 'ready'
      error.value = ''
    } catch (e) {
      if (e.name === 'AbortError') return
      if (e.status === 401) return (session.user = null)
      error.value = e.message
      status.value = 'error'
    }
  }

  async function run(action, success) {
    if (busy.value) return false
    busy.value = true
    notice.value = actionError.value = ''
    try {
      await action()
      notice.value = success
      await load()
      return true
    } catch (e) {
      if (e.status === 401) session.user = null
      else if (e.status === 409) {
        actionError.value = 'La tarea cambió en otro lugar. Se cargó la versión actual; inténtalo de nuevo.'
        await load()
      } else actionError.value = e.message
      return false
    } finally {
      busy.value = false
    }
  }

  const create = data => run(() => api.createTask(data), 'Tarea creada.')
  const update = (task, changes) => run(() => api.updateTask(task.id, { ...changes, version: task.version }), 'Tarea actualizada.')
  const remove = task => run(() => api.deleteTask(task.id, task.version), 'Tarea eliminada.')

  // El servidor avisa por SSE cuando cambia algo (p. ej. desde otra pestaña).
  function listen() {
    source = new EventSource(EVENTS_URL)
    EVENT_NAMES.forEach(name => source.addEventListener(name, load))
  }
  function stop() {
    source?.close()
    controller?.abort()
  }

  return { tasks, status, error, notice, actionError, busy, load, create, update, remove, listen, stop }
}
