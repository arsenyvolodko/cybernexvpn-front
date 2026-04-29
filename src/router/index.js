import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => {
        // Если уже есть закешированный токен — сразу открываем профиль с ним в URL.
        let token = null
        try { token = localStorage.getItem('api_token') } catch { /* ignore */ }
        return token ? `/${token}` : { name: 'profile-no-token' }
      },
    },
    {
      // Обратная совместимость: старые ссылки вида /profile?token=<uuid>.
      path: '/profile',
      name: 'profile-no-token',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      // Новый формат: токен прямо в URL вида /<uuid>.
      path: '/:token([A-Za-z0-9_-]{16,})',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      props: true,
    },
  ],
})

export default router