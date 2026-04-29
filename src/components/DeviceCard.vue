<script setup>
import { ref } from 'vue'
import api from '../api/index.js'
import ConnectModal from './ConnectModal.vue'
import EditDeviceModal from './EditDeviceModal.vue'

const props = defineProps({
  device: { type: Object, required: true },
  userId: { type: Number, required: true },
})
const emit = defineEmits(['deleted', 'updated'])

const loading = ref(false)
const error = ref(null)
const showConnect = ref(false)
const showEdit = ref(false)

const CLIENT_TYPE_LABELS = {
  android: 'Android',
  iphone: 'iOS',
  windows: 'Windows',
  macos: 'macOS',
  unknown: 'Устройство',
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function toggleAutoRenew() {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.patch(
      `/admin/users/${props.userId}/clients/${props.device.id}/`,
      { auto_renew: !props.device.auto_renew }
    )
    emit('updated', data)
  } catch {
    error.value = 'Не удалось изменить настройку'
  } finally {
    loading.value = false
  }
}

async function reactivate() {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.post(
      `/admin/users/${props.userId}/clients/${props.device.id}/reactivate/`
    )
    emit('updated', data)
  } catch (e) {
    error.value = e.response?.data?.detail || 'Не удалось возобновить. Проверьте баланс.'
  } finally {
    loading.value = false
  }
}

async function deleteDevice() {
  if (!confirm(`Удалить устройство "${props.device.name}"?`)) return
  loading.value = true
  error.value = null
  try {
    await api.delete(`/admin/users/${props.userId}/clients/${props.device.id}/`)
    emit('deleted', props.device.id)
  } catch {
    error.value = 'Не удалось удалить'
    loading.value = false
  }
}
</script>

<template>
  <div class="device-card" :class="{ inactive: !device.is_active }">
    <div class="card-header">
      <div class="device-title">
        <span class="device-name">{{ device.name }}</span>
        <span class="device-type">{{ CLIENT_TYPE_LABELS[device.type] ?? 'Устройство' }}</span>
      </div>
      <span class="status-badge" :class="device.is_active ? 'active' : 'stopped'">
        {{ device.is_active ? 'Активно' : 'Остановлено' }}
      </span>
    </div>

    <div class="card-meta">
      <div class="meta-row">
        <span class="meta-label">Сервер</span>
        <span>{{ device.server.name }} <span class="tag">{{ device.server.tag }}</span></span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Стоимость</span>
        <span>{{ device.price }} ₽ / мес</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">{{ device.is_active ? 'Активно до' : 'Истекло' }}</span>
        <span>{{ formatDate(device.end_date) }}</span>
      </div>
    </div>

    <div v-if="device.is_active" class="auto-renew-row">
      <span class="meta-label">Автопродление</span>
      <button
        class="toggle"
        :class="{ on: device.auto_renew }"
        :disabled="loading"
        @click="toggleAutoRenew"
      >
        <span class="toggle-knob" />
      </button>
    </div>

    <div v-if="error" class="card-error">{{ error }}</div>

    <div class="card-actions">
      <div class="actions-primary">
        <button
          v-if="device.is_active"
          class="btn-accent"
          :disabled="loading"
          @click="showConnect = true"
        >
          Как подключить
        </button>
        <button
          v-else
          class="btn-accent"
          :disabled="loading"
          @click="reactivate"
        >
          {{ loading ? '...' : 'Возобновить' }}
        </button>
      </div>
      <div class="actions-secondary">
        <button
          class="btn-ghost"
          :disabled="loading"
          @click="showEdit = true"
        >
          Изменить
        </button>
        <button class="btn-danger" :disabled="loading" @click="deleteDevice">
          Удалить
        </button>
      </div>
    </div>
  </div>

  <ConnectModal
    v-if="showConnect"
    :device="device"
    :user-id="userId"
    @close="showConnect = false"
  />

  <EditDeviceModal
    v-if="showEdit"
    :device="device"
    :user-id="userId"
    @close="showEdit = false"
    @updated="(d) => emit('updated', d)"
  />
</template>

<style scoped>
.device-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: opacity 0.2s;
}
.device-card.inactive { opacity: 0.75; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.device-title { display: flex; flex-direction: column; gap: 2px; }
.device-name { font-weight: 600; font-size: 1rem; color: var(--text); }
.device-type { font-size: 0.8rem; color: var(--muted); }

.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
}
.status-badge.active { background: #d6ede1; color: #2a6b44; }
.status-badge.stopped { background: #f0e0d6; color: #7a3a1a; }

.card-meta { display: flex; flex-direction: column; gap: 6px; }
.meta-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
.meta-label { color: var(--muted); }
.tag {
  font-size: 0.75rem;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 5px;
  margin-left: 4px;
  color: var(--muted);
}

.auto-renew-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
}
.toggle {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  border: none;
  background: var(--border);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  padding: 0;
}
.toggle.on { background: var(--accent-strong); }
.toggle:disabled { opacity: 0.5; cursor: not-allowed; }
.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: left 0.2s;
  pointer-events: none;
}
.toggle.on .toggle-knob { left: 21px; }

.card-error { font-size: 0.85rem; color: #9b3a1a; }

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
}
.actions-primary { display: flex; gap: 8px; }
.actions-secondary { display: flex; gap: 8px; margin-left: auto; }
.actions-primary > button,
.actions-secondary > button { white-space: nowrap; }

.btn-ghost {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-ghost:hover { background: var(--bg-soft); }
.btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-accent {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: var(--accent-strong);
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-accent:hover { background: var(--text); }
.btn-accent:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-danger {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e0b8a8;
  background: transparent;
  color: #9b3a1a;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-danger:hover { background: #f9ece2; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
</style>