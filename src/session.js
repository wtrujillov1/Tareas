import { reactive } from 'vue'
import { api } from './services/api'

// Estado compartido mínimo: quién está autenticado.
export const session = reactive({ user: null, checked: false, offline: false })

export async function restoreSession() {
  try {
    session.user = await api.me()
    session.offline = false
  } catch (error) {
    session.user = null
    session.offline = error.code === 'NETWORK'
  } finally {
    session.checked = true
  }
}
