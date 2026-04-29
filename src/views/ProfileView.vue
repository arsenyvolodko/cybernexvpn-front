<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/index.js'
import DeviceCard from '../components/DeviceCard.vue'
import AddDeviceModal from '../components/AddDeviceModal.vue'
import TopUpModal from '../components/TopUpModal.vue'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const devices = ref([])
const servers = ref([])
const loading = ref(true)
const error = ref(null)

const showAddDevice = ref(false)
const showTopUp = ref(false)

onMounted(async () => {
  // Если в URL есть ?token=xxx — сохраняем и убираем из адресной строки
  const urlToken = route.query.token
  if (urlToken) {
    localStorage.setItem('api_token', urlToken)
    router.replace({ path: '/profile' })
  }

  const token = localStorage.getItem('api_token')
  if (!token) {
    error.value = 'Токен не найден. Перейдите по ссылке из Telegram-бота.'
    loading.value = false
    return
  }

  await loadAll()
})

async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const [userRes, serversRes] = await Promise.all([
      api.get('/user/me/'),
      api.get('/admin/servers/'),
    ])
    user.value = userRes.data
    servers.value = serversRes.data

    const devicesRes = await api.get(`/admin/users/${user.value.id}/clients/`)
    devices.value = devicesRes.data
  } catch (e) {
    if (e.response?.status === 401 || e.response?.status === 403) {
      error.value = 'Токен недействителен. Перейдите по новой ссылке из бота.'
    } else {
      error.value = 'Не удалось загрузить данные. Попробуйте позже.'
    }
  } finally {
    loading.value = false
  }
}

function onDeviceUpdated(updatedDevice) {
  const idx = devices.value.findIndex(d => d.id === updatedDevice.id)
  if (idx !== -1) devices.value[idx] = updatedDevice
  // Обновляем баланс (мог списаться при reactivate)
  api.get('/user/me/').then(r => { user.value = r.data })
}

function onDeviceDeleted(deviceId) {
  devices.value = devices.value.filter(d => d.id !== deviceId)
}

function onDeviceCreated(newDevice) {
  devices.value.push(newDevice)
  showAddDevice.value = false
  // Обновляем баланс — он уменьшился
  api.get('/user/me/').then(r => { user.value = r.data })
}

const activeDevices = computed(() => devices.value.filter(d => d.is_active))
const inactiveDevices = computed(() => devices.value.filter(d => !d.is_active))
const availableServers = computed(() => servers.value.filter(s => s.has_available_ips))

// Сумма подписок в месяц — для инфоблока рядом с балансом
const monthlyCost = computed(() =>
  activeDevices.value.reduce((sum, d) => sum + (d.price ?? 0), 0)
)
</script>

<template>
  <div class="page">
    <!-- Ошибка / нет токена -->
    <div v-if="error" class="container">
      <div class="alert">{{ error }}</div>
    </div>

    <!-- Загрузка -->
    <div v-else-if="loading" class="container loader-wrap">
      <div class="loader" />
    </div>

    <!-- Основной контент -->
    <template v-else-if="user">
      <!-- Декоративный фон -->
      <div class="bg-decor" aria-hidden="true">
        <div class="blob blob-1" />
        <div class="blob blob-2" />
      </div>

      <!-- Шапка: только бренд и юзернейм -->
      <header class="profile-header">
        <div class="container header-inner">
          <div class="brand">
            <img src="/logo.png" alt="CyberNex VPN" class="brand-logo" />
            <span class="brand-text">cybernexvpn</span>
          </div>
          <div class="user-chip">
            <span class="user-dot" />
            <span class="username">{{ user.username ?? 'Пользователь' }}</span>
          </div>
        </div>
      </header>

      <main class="container main-content">
        <!-- Большая карточка баланса -->
        <section class="balance-card">
          <div class="balance-left">
            <div class="balance-label">Баланс</div>
            <div class="balance-value">
              {{ user.balance }}<span class="balance-currency"> ₽</span>
            </div>
            <div v-if="monthlyCost > 0" class="balance-sub">
              Подписки: {{ monthlyCost }} ₽/мес
            </div>
            <div v-else class="balance-sub">Подписок пока нет</div>
          </div>
          <div class="balance-right">
            <button class="btn-topup-big" @click="showTopUp = true">
              Пополнить
            </button>
          </div>
        </section>

        <!-- Активные устройства -->
        <section>
          <div class="section-header">
            <h2>Мои устройства</h2>
            <button
              class="btn-add"
              :disabled="availableServers.length === 0"
              @click="showAddDevice = true"
            >
              + Добавить
            </button>
          </div>

          <div v-if="availableServers.length === 0 && devices.length === 0" class="empty-hint">
            Нет доступных серверов. Обратитесь в поддержку.
          </div>

          <div v-if="activeDevices.length > 0" class="devices-grid">
            <DeviceCard
              v-for="device in activeDevices"
              :key="device.id"
              :device="device"
              :user-id="user.id"
              @updated="onDeviceUpdated"
              @deleted="onDeviceDeleted"
            />
          </div>

          <p v-else class="empty-hint">
            Активных устройств нет. Нажмите «+ Добавить», чтобы подключить первое.
          </p>
        </section>

        <!-- Неактивные устройства -->
        <section v-if="inactiveDevices.length > 0">
          <h2 class="section-title-muted">Остановленные</h2>
          <div class="devices-grid">
            <DeviceCard
              v-for="device in inactiveDevices"
              :key="device.id"
              :device="device"
              :user-id="user.id"
              @updated="onDeviceUpdated"
              @deleted="onDeviceDeleted"
            />
          </div>
        </section>

        <!-- Контакты поддержки -->
        <section class="support-card">
          <div class="support-text">
            <div class="support-title">Нужна помощь?</div>
            <div class="support-sub">Напишите мне — отвечу и помогу разобраться.</div>
          </div>
          <div class="support-links">
            <a
              href="https://t.me/arseny_volodko"
              target="_blank"
              rel="noopener noreferrer"
              class="support-btn tg"
            >
              Telegram
            </a>
            <a
              href="https://vk.ru/arseny_volodko"
              target="_blank"
              rel="noopener noreferrer"
              class="support-btn vk"
            >
              ВКонтакте
            </a>
          </div>
        </section>
      </main>
    </template>

    <!-- Модалки -->
    <AddDeviceModal
      v-if="showAddDevice"
      :servers="servers"
      :user-id="user.id"
      @close="showAddDevice = false"
      @created="onDeviceCreated"
    />

    <TopUpModal
      v-if="showTopUp"
      :user-id="user.id"
      @close="showTopUp = false"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

/* Декоративные «пятна» на фоне — неяркие, для живости */
.bg-decor {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.5;
}
.blob-1 {
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(142, 167, 180, 0.55), transparent 70%);
  top: -180px;
  right: -140px;
}
.blob-2 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(216, 205, 168, 0.65), transparent 70%);
  bottom: -120px;
  left: -100px;
}

.profile-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(242, 234, 211, 0.78);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 14px;
  padding-bottom: 14px;
  position: relative;
  z-index: 1;
}
.brand { display: flex; align-items: center; gap: 10px; }
.brand-logo { width: 32px; height: 32px; }
.brand-text { font-weight: 700; font-size: 1rem; color: var(--text); letter-spacing: -0.01em; }

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.85rem;
  color: var(--text);
}
.user-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5cb67c;
  box-shadow: 0 0 0 3px rgba(92, 182, 124, 0.18);
}
.username { font-weight: 500; }

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 28px;
  padding-bottom: 48px;
  position: relative;
  z-index: 1;
}

/* Большая карточка баланса */
.balance-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 28px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, #4b6370 0%, #3e4f5a 60%, #2e3d46 100%);
  color: #f5efe0;
  box-shadow: 0 20px 40px -20px rgba(62, 79, 90, 0.35);
  overflow: hidden;
}
.balance-card::after {
  content: '';
  position: absolute;
  right: -80px;
  top: -80px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(216, 205, 168, 0.28), transparent 70%);
  pointer-events: none;
}
.balance-left { position: relative; z-index: 1; }
.balance-label {
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(245, 239, 224, 0.7);
  margin-bottom: 6px;
}
.balance-value {
  font-size: clamp(2.2rem, 6vw, 3rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.balance-currency { font-weight: 500; opacity: 0.75; font-size: 0.7em; }
.balance-sub {
  margin-top: 8px;
  font-size: 0.88rem;
  color: rgba(245, 239, 224, 0.75);
}

.balance-right { position: relative; z-index: 1; flex-shrink: 0; }
.btn-topup-big {
  padding: 12px 22px;
  border-radius: 12px;
  border: 1px solid rgba(245, 239, 224, 0.25);
  background: rgba(245, 239, 224, 0.12);
  color: #f5efe0;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.05s;
  backdrop-filter: blur(6px);
}
.btn-topup-big:hover { background: rgba(245, 239, 224, 0.22); }
.btn-topup-big:active { transform: translateY(1px); }

/* Секция устройств */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text);
  letter-spacing: -0.01em;
}

.section-title-muted {
  font-size: 1rem;
  color: var(--muted);
  margin: 0 0 12px;
  font-weight: 500;
}

.btn-add {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: var(--accent-strong);
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.05s;
}
.btn-add:hover { background: var(--text); }
.btn-add:active { transform: translateY(1px); }
.btn-add:disabled { opacity: 0.4; cursor: not-allowed; }

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

.empty-hint {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0;
  padding: 24px;
  text-align: center;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
}

/* Контакты поддержки */
.support-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  flex-wrap: wrap;
}
.support-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text);
  margin-bottom: 4px;
}
.support-sub { font-size: 0.9rem; color: var(--muted); }
.support-links { display: flex; gap: 8px; flex-wrap: wrap; }
.support-btn {
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.05s, background 0.15s, box-shadow 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.support-btn.tg {
  background: #2aabee;
  color: white;
}
.support-btn.tg:hover { background: #1f8fc9; }
.support-btn.vk {
  background: #0077ff;
  color: white;
}
.support-btn.vk:hover { background: #0064d1; }
.support-btn:active { transform: translateY(1px); }

.loader-wrap {
  display: flex;
  justify-content: center;
  padding-top: 80px;
}
.loader {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent-strong);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.alert {
  margin-top: 40px;
  background: #f9ece2;
  border: 1px solid #e6c5aa;
  color: #7a3a1a;
  border-radius: var(--radius);
  padding: 16px 20px;
}

@media (max-width: 640px) {
  .header-inner { gap: 10px; }
  .brand-text { display: none; }
  .devices-grid { grid-template-columns: 1fr; }
  .balance-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 22px 20px;
    gap: 16px;
  }
  .balance-right { width: 100%; }
  .btn-topup-big { width: 100%; }
  .support-card { flex-direction: column; align-items: flex-start; }
  .support-links { width: 100%; }
  .support-btn { flex: 1; justify-content: center; }
}
</style>