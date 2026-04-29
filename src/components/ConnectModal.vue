<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../api/index.js'

const props = defineProps({
  device: { type: Object, required: true },
  userId: { type: Number, required: true },
})
const emit = defineEmits(['close'])

const qrImageUrl = ref(null)
const loadingQr = ref(false)
const qrError = ref(null)

// Определяем, с мобильного или десктопа открыли страницу.
// Берём User-Agent, но с поправкой на iPadOS (который маскируется под Mac).
function detectIsMobile() {
  const ua = navigator.userAgent || ''
  if (/android|iphone|ipod|windows phone/i.test(ua)) return true
  // iPadOS 13+ сообщает "Macintosh", но у него touch-экран
  if (/ipad/i.test(ua)) return true
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true
  return false
}

const isMobile = ref(detectIsMobile())

// Ссылки на WireGuard по ОС — взяты из vpnBot (new_text_storage.py)
const WIREGUARD_LINKS = {
  windows: 'https://www.wireguard.com/install/',
  macos: 'https://apps.apple.com/ru/app/wireguard/id1451685025?mt=12',
  iphone: 'https://apps.apple.com/us/app/wireguard/id1441195209',
  android: 'https://play.google.com/store/apps/details?id=com.wireguard.android',
}

// Имя файла конфига формируем как в vpnBot (bot/utils/common.py:get_filename):
// для Android берём случайный регистровый вариант "cybernexvpn", для остального — фиксированное.
// Why: в Android-версии WireGuard имя файла иногда видно в системных уведомлениях,
// и одинаковый текст у всех клиентов выглядит подозрительно — варианты регистра помогают.
const ANDROID_NAME_CHOICES = [
  'cybernexvpn', 'cybernexVpn', 'cybernexVPN',
  'cyberNexvpn', 'cyberNexVpn', 'cyberNexVPN',
  'Cybernexvpn', 'CybernexVpn', 'CybernexVPN',
  'CyberNexvpn', 'CyberNexVpn', 'CyberNexVPN',
]
function buildConfigFilename(device) {
  const base = device.type === 'android'
    ? ANDROID_NAME_CHOICES[Math.floor(Math.random() * ANDROID_NAME_CHOICES.length)]
    : 'cybernexvpn'
  const tag = device.server?.tag ?? ''
  return tag ? `${base}-${tag}.conf` : `${base}.conf`
}

const deviceType = computed(() => props.device.type)
const isMobileDevice = computed(() => ['iphone', 'android'].includes(deviceType.value))
const isDesktopDevice = computed(() => ['windows', 'macos'].includes(deviceType.value))

// Определяем режим показа: qr / download
//  - Телефон-пользователь + iPhone-устройство  → download (скачать .conf прямо здесь) + инструкция iPhone
//  - Телефон-пользователь + Android-устройство → qr + инструкция Android (скан с другого экрана)
//  - Ноут-пользователь    + iPhone/Android     → qr (показать на экране ноута, сканировать с телефона)
//  - Ноут-пользователь    + Windows/macOS      → download + инструкция по ОС
const mode = computed(() => {
  if (isMobile.value && deviceType.value === 'iphone') return 'download'
  if (isMobile.value && deviceType.value === 'android') return 'qr'
  if (!isMobile.value && isMobileDevice.value) return 'qr'
  if (!isMobile.value && isDesktopDevice.value) return 'download'
  // fallback
  return isMobileDevice.value ? 'qr' : 'download'
})

// Ключ сценария — по нему выбираем инструкцию
const scenarioKey = computed(() => {
  const platform = isMobile.value ? 'mobile' : 'desktop'
  return `${platform}_${deviceType.value}`
})

// Инструкции под все 4 × 2 = 8 комбинаций (заглушки там, где не было готового текста).
// Готовые берём из vpnBot/new_text_storage.py, остальное — плейсхолдеры под дозаполнение.
const INSTRUCTIONS = {
  // Телефон + iPhone: скачиваем .conf прямо с телефона и открываем в WireGuard
  mobile_iphone: {
    title: 'Подключение на iPhone',
    link: WIREGUARD_LINKS.iphone,
    linkLabel: 'Скачать WireGuard из App Store',
    steps: [
      'Установите приложение WireGuard из App Store.',
      'Нажмите кнопку «Скачать файл подключения» ниже — файл сохранится на устройство.',
      'Откройте WireGuard → «+» → «Создать из файла или архива» → выберите сохранённый .conf.',
      'Включите туннель переключателем.',
    ],
  },
  // Телефон + Android: удобнее показать QR, но на самом телефоне его не отсканируешь,
  // поэтому параллельно оставляем возможность скачать .conf.
  mobile_android: {
    title: 'Подключение на Android',
    link: WIREGUARD_LINKS.android,
    linkLabel: 'Скачать WireGuard из Google Play',
    steps: [
      'Установите приложение WireGuard из Google Play.',
      'Откройте этот QR-код на другом устройстве — либо скачайте файл .conf кнопкой выше.',
      'В WireGuard нажмите «+» → «Импорт туннеля из файла или архива» (или «из QR-кода», если есть второй экран).',
      'Введите любое название, например «vpn».',
    ],
  },
  // Ноут-пользователь открывает страницу, а устройство — телефон: показываем QR для сканирования.
  desktop_iphone: {
    title: 'Подключение на iPhone (с ноутбука)',
    link: WIREGUARD_LINKS.iphone,
    linkLabel: 'Ссылка на WireGuard в App Store',
    steps: [
      'На iPhone установите приложение WireGuard из App Store.',
      'В WireGuard нажмите «+» → «Создать из QR-кода».',
      'Отсканируйте QR-код с экрана ноутбука.',
      'Введите любое название туннеля, например «vpn».',
      'Включите туннель переключателем.',
    ],
  },
  desktop_android: {
    title: 'Подключение на Android (с ноутбука)',
    link: WIREGUARD_LINKS.android,
    linkLabel: 'Ссылка на WireGuard в Google Play',
    steps: [
      'На телефоне установите WireGuard из Google Play.',
      'В приложении нажмите «+» → «Импорт туннеля из QR-кода».',
      'Отсканируйте QR-код с экрана ноутбука.',
      'Введите любое название туннеля, например «vpn».',
      'Включите туннель переключателем.',
    ],
  },
  // Ноут + Windows
  desktop_windows: {
    title: 'Подключение на Windows',
    link: WIREGUARD_LINKS.windows,
    linkLabel: 'Скачать WireGuard для Windows',
    steps: [
      'Скачайте и установите приложение WireGuard по ссылке выше.',
      'Скачайте файл подключения .conf кнопкой выше.',
      'Откройте WireGuard → «Добавить туннель» → выберите скачанный .conf файл.',
      'Нажмите «Подключиться».',
    ],
  },
  // Ноут + macOS
  desktop_macos: {
    title: 'Подключение на macOS',
    link: WIREGUARD_LINKS.macos,
    linkLabel: 'Скачать WireGuard из Mac App Store',
    steps: [
      'Установите WireGuard из Mac App Store по ссылке выше.',
      'Скачайте файл подключения .conf кнопкой выше.',
      'Откройте WireGuard → «Import Tunnel(s) from File…» → выберите скачанный .conf файл.',
      'Включите туннель переключателем.',
    ],
  },
  // На случай, если тип устройства Windows/macOS, а открыто с телефона — редко, но возможно.
  // Первым шагом просим открыть страницу на самом компьютере, дальше — те же шаги, что и в desktop_*.
  mobile_windows: {
    title: 'Подключение на Windows',
    link: WIREGUARD_LINKS.windows,
    linkLabel: 'Скачать WireGuard для Windows',
    steps: [
      'Откройте эту страницу на самом компьютере — так проще скачать файл и установить программу.',
      'Скачайте и установите приложение WireGuard по ссылке выше.',
      'Скачайте файл подключения .conf кнопкой выше.',
      'Откройте WireGuard → «Добавить туннель» → выберите скачанный .conf файл.',
      'Нажмите «Подключиться».',
    ],
  },
  mobile_macos: {
    title: 'Подключение на macOS',
    link: WIREGUARD_LINKS.macos,
    linkLabel: 'Скачать WireGuard из Mac App Store',
    steps: [
      'Откройте эту страницу на самом Mac — так проще скачать файл и установить программу.',
      'Установите WireGuard из Mac App Store по ссылке выше.',
      'Скачайте файл подключения .conf кнопкой выше.',
      'Откройте WireGuard → «Import Tunnel(s) from File…» → выберите скачанный .conf файл.',
      'Включите туннель переключателем.',
    ],
  },
}

const instruction = computed(() => INSTRUCTIONS[scenarioKey.value] ?? INSTRUCTIONS.desktop_windows)

// Загружаем QR только если он нужен
onMounted(async () => {
  if (mode.value !== 'qr') return
  loadingQr.value = true
  qrError.value = null
  try {
    const { data } = await api.get(
      `/admin/users/${props.userId}/clients/${props.device.id}/qr/`,
      { responseType: 'blob' }
    )
    qrImageUrl.value = URL.createObjectURL(data)
  } catch {
    qrError.value = 'Не удалось загрузить QR-код'
  } finally {
    loadingQr.value = false
  }
})

onUnmounted(() => {
  if (qrImageUrl.value) URL.revokeObjectURL(qrImageUrl.value)
})

const downloading = ref(false)
async function downloadConfig() {
  downloading.value = true
  try {
    const { data } = await api.get(
      `/admin/users/${props.userId}/clients/${props.device.id}/config/`,
      { responseType: 'blob' }
    )
    const objectUrl = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = buildConfigFilename(props.device)
    a.click()
    URL.revokeObjectURL(objectUrl)
  } catch {
    // ignore
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ instruction.title }}</h3>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="content">
        <!-- Ссылка на WireGuard -->
        <a
          v-if="instruction.link"
          :href="instruction.link"
          target="_blank"
          rel="noopener noreferrer"
          class="wg-link"
        >
          {{ instruction.linkLabel }}
        </a>

        <!-- QR — когда mode=qr -->
        <div v-if="mode === 'qr'" class="qr-block">
          <div v-if="loadingQr" class="qr-loader">
            <div class="loader" />
          </div>
          <div v-else-if="qrError" class="qr-error">{{ qrError }}</div>
          <img v-else-if="qrImageUrl" :src="qrImageUrl" alt="QR-код" class="qr-image" />
        </div>

        <!-- Скачать .conf — когда mode=download ИЛИ как запасной вариант для android-с-телефона -->
        <button
          v-if="mode === 'download' || (mode === 'qr' && deviceType === 'android' && isMobile)"
          class="btn-download"
          :disabled="downloading"
          @click="downloadConfig"
        >
          {{ downloading ? 'Скачиваем...' : 'Скачать файл подключения (.conf)' }}
        </button>

        <!-- Инструкция -->
        <ol class="steps">
          <li v-for="(step, i) in instruction.steps" :key="i">{{ step }}</li>
        </ol>
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
  max-width: 460px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}
.modal-header h3 { margin: 0; font-size: 1.05rem; line-height: 1.3; }
.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--muted);
  padding: 4px 6px;
  flex-shrink: 0;
}
.close-btn:hover { color: var(--text); }

.content { display: flex; flex-direction: column; gap: 16px; }

.wg-link {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.9rem;
  color: var(--accent-strong);
  text-decoration: none;
  border-bottom: 1px dashed var(--accent);
  padding-bottom: 1px;
}
.wg-link:hover { color: var(--text); border-bottom-color: var(--text); }

.steps {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.steps li { font-size: 0.95rem; color: var(--text); line-height: 1.4; }

.qr-block {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
}
.qr-image {
  width: 220px;
  height: 220px;
  border-radius: 8px;
}
.qr-loader { display: flex; justify-content: center; }
.loader {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent-strong);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.qr-error { font-size: 0.85rem; color: #9b3a1a; }

.btn-download {
  width: 100%;
  padding: 11px 16px;
  border-radius: 10px;
  border: none;
  background: var(--accent-strong);
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-download:hover { background: var(--text); }
.btn-download:disabled { opacity: 0.6; cursor: not-allowed; }
</style>