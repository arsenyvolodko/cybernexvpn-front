<script setup>
import { ref, computed } from 'vue'
import api from '../api/index.js'

const props = defineProps({
  userId: { type: Number, required: true },
})
const emit = defineEmits(['close'])

const QUICK_AMOUNTS = [100, 150, 300, 500, 1000]
const amount = ref(300)
const loading = ref(false)
const error = ref(null)

const canSubmit = computed(() =>
  !!amount.value && amount.value > 0 && !loading.value
)

function onAmountKeydown(e) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight']
  if (allowed.includes(e.key)) return
  if (!/^\d$/.test(e.key)) e.preventDefault()
}

async function submit() {
  if (!canSubmit.value) return
  loading.value = true
  error.value = null
  try {
    const { data } = await api.post(`/admin/users/${props.userId}/payments/`, {
      value: amount.value,
      return_url: window.location.href,
    })
    window.location.href = data.url
  } catch (e) {
    error.value = e.response?.data?.detail || 'Не удалось создать платёж'
    loading.value = false
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>Пополнить баланс</h3>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="form">
        <div class="quick-amounts">
          <button
            v-for="q in QUICK_AMOUNTS"
            :key="q"
            class="quick-btn"
            :class="{ selected: amount === q }"
            @click="amount = q"
          >
            {{ q }} ₽
          </button>
        </div>

        <label class="field">
          <span class="field-label">Сумма <span class="required">*</span></span>
          <div class="amount-input-wrap">
            <input
              v-model.number="amount"
              type="number"
              min="1"
              max="99999"
              step="1"
              @keydown="onAmountKeydown"
              @paste.prevent
            />
            <span class="currency">₽</span>
          </div>
        </label>

        <div v-if="error" class="form-error">{{ error }}</div>

        <div class="modal-actions">
          <button class="btn-ghost" @click="emit('close')">Отмена</button>
          <button
            class="btn-accent"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ loading ? 'Переход к оплате...' : `Оплатить ${amount} ₽` }}
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
  max-width: 380px;
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

.form { display: flex; flex-direction: column; gap: 16px; }

.quick-amounts { display: flex; gap: 8px; flex-wrap: wrap; }
.quick-btn {
  flex: 1;
  min-width: 64px;
  padding: 8px 4px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.1s;
}
.quick-btn:hover { border-color: var(--accent-strong); }
.quick-btn.selected {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
  color: white;
}

.field { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 0.85rem; color: var(--muted); font-weight: 500; }
.required { color: #c0392b; }

.amount-input-wrap { position: relative; }
.amount-input-wrap input {
  width: 100%;
  padding: 9px 12px;
  padding-right: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
}
.amount-input-wrap input:focus { border-color: var(--accent-strong); }
.currency {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}

/* Убираем стрелки у number input */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
input[type="number"] { -moz-appearance: textfield; appearance: textfield; }

.form-error { font-size: 0.85rem; color: #9b3a1a; }
.amount-input-wrap input.input-error { border-color: #c0392b; }
.amount-input-wrap input.input-error:focus { border-color: #c0392b; }

.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
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