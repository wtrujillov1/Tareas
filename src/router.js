import { createRouter, createWebHistory } from 'vue-router'
import { session, restoreSession } from './session'
import LoginView from './views/LoginView.vue'
import TasksView from './views/TasksView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'tasks', component: TasksView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async to => {
  if (!session.checked) await restoreSession()
  if (to.meta.requiresAuth && !session.user) return { name: 'login' }
  if (to.name === 'login' && session.user) return { name: 'tasks' }
})

export default router
