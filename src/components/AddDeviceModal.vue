<script setup>
import { ref } from 'vue'
import api from '../api/index.js'

const props = defineProps({
  servers: { type: Array, required: true },
  userId: { type: Number, required: true },
})
const emit = defineEmits(['close', 'created'])

const selectedServerId = ref(props.servers.find(s => s.has_available_ips)?.id ?? null)
const name = ref('')
const type = ref('android')
const loading = ref(false)
const error = ref(null)

const TYPES = [
  { value: 'android', label: 'Android' },
  { value: 'iphone', label: 'iOS' },
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
]

async function submit() {
  if (!selectedServerId.value) return
  loading.value = true
  error.value = null
  try {
    const payload = { server_id: selectedServerId.value, type: type.value }
    if (name.value.trim()) payload.name = name.value.trim()
    const { data } = await api.post(`/admin/users/${props.userId}/clients/`, payload)
    emit('created', data)
  } catch (e) {
    error.value = e.response?.data?.detail || 'Не удалось добавить. Проверьте баланс.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>Добавить устройство</h3>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="form">
        <label class="field">
          <span class="field-label">Сервер <span class="required">*</span></span>
          <select v-model="selectedServerId">
            <option
              v-for="s in servers"
              :key="s.id"
              :value="s.id"
              :disabled="!s.has_available_ips"
            >
              {{ s.name.replace(/\s*\([^)]*\)\s*/g, ' ').trim() }}{{ !s.has_available_ips ? ' (нет мест)' : '' }}
            </option>
          </select>
        </label>

        <label class="field">
          <span class="field-label">Имя устройства</span>
          <input v-model="name" type="text" placeholder="Например: Мой телефон" maxlength="63" />
        </label>

        <label class="field">
          <span class="field-label">Тип устройства <span class="required">*</span></span>
          <select v-model="type">
            <option v-for="t in TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </label>

        <div v-if="error" class="form-error">{{ error }}</div>

        <div class="modal-actions">
          <button class="btn-ghost" @click="emit('close')">Отмена</button>
          <button
            class="btn-accent"
            :disabled="!selectedServerId || loading"
            @click="submit"
          >
            {{ loading ? 'Создаём...' : 'Добавить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(62, 79, 90, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 100%;
  max-width: 440px;
  padding: 24px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--muted);
  padding: 4px 6px;
}
.close-btn:hover { color: var(--text); }

.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 0.85rem; color: var(--muted); font-weight: 500; }
.required { color: #c0392b; }

select, input[type="text"] {
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
}
select:focus, input:focus { border-color: var(--accent-strong); }

.form-error { font-size: 0.85rem; color: #9b3a1a; }

.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.btn-ghost {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
}
.btn-ghost:hover { background: var(--bg-soft); }
.btn-accent {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: var(--accent-strong);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-accent:hover { background: var(--text); }
.btn-accent:disabled { opacity: 0.5; cursor: not-allowed; }
</style>