<script setup>
// Ссылка на Telegram-бота берётся из env (VITE_TG_BOT_URL).
// Если её нет — используем заглушку, которая никуда не уводит, но кнопка
// остаётся видимой, чтобы вёрстка не «прыгала» на разных окружениях.
const tgBotUrl = import.meta.env.VITE_TG_BOT_URL || ''

// Если в localStorage уже есть api_token — значит, у пользователя уже есть кабинет.
// Показываем кнопку «Личный кабинет», ведущую на /<token>.
let cachedToken = ''
try { cachedToken = localStorage.getItem('api_token') || '' } catch { /* ignore */ }
const cabinetUrl = cachedToken ? `/${cachedToken}` : ''

const features = [
  {
    icon: '⚡',
    title: 'Быстро',
    text: 'WireGuard под капотом и серверы с низкой задержкой — стримы и созвоны без подвисаний.',
  },
  {
    icon: '🔒',
    title: 'Приватно',
    text: 'Шифрование трафика, никаких логов активности. Только вы знаете, что вы открываете.',
  },
  {
    icon: '🇷🇺',
    title: 'Оплата в рублях',
    text: 'Российские карты, СБП, ЮKassa. Без танцев с зарубежными картами и крипто-кошельками.',
  },
  {
    icon: '📱',
    title: 'Любое устройство',
    text: 'iPhone, Android, Windows, macOS, Linux — один аккаунт, неограниченное число конфигов.',
  },
  {
    icon: '🌐',
    title: 'Telegram или Web',
    text: 'Авторизация в сервисе — один раз через бота. Дальше управляйте устройствами, конфигами и оплатой прямо в браузере, даже если Telegram недоступен.',
  },
  {
    icon: '💌',
    title: 'Реферальные ссылки',
    text: 'Приглашайте друзей и получайте бонусы',
  },
]

const steps = [
  { n: 1, title: 'Открыть бота', text: 'Перейдите в Telegram-бот и нажмите «Старт».' },
  { n: 2, title: 'Создать устройство', text: 'Выберите ОС и сервер — получите готовый QR или файл.' },
  { n: 3, title: 'Подключиться', text: 'Импортируйте конфиг в WireGuard — и всё работает.' },
]
</script>

<template>
  <div class="page">
    <!-- Декоративные «пятна» на фоне -->
    <div class="bg-decor" aria-hidden="true">
      <div class="blob blob-1" />
      <div class="blob blob-2" />
    </div>

    <!-- Шапка -->
    <header class="site-header">
      <div class="container header-inner">
        <div class="brand">
          <img src="/logo.png" alt="CyberNex VPN" class="brand-logo" />
          <span class="brand-text">cybernexvpn</span>
        </div>
        <nav class="header-nav">
          <a href="#features" class="nav-link">Возможности</a>
          <a href="#how" class="nav-link">Как это работает</a>
          <a
            v-if="cabinetUrl"
            :href="cabinetUrl"
            class="nav-cta nav-cta-primary"
          >
            Личный кабинет →
          </a>
          <a
            v-else-if="tgBotUrl"
            :href="tgBotUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="nav-cta"
          >
            Telegram-бот
          </a>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="badge">
            VPN для друзей,<br />
            ставший чем-то большим
          </span>
          <h1>Cybernexvpn</h1>
          <p class="lead">
            Приватный трафик, быстрые серверы, оплата в&nbsp;рублях. Управление в&nbsp;Telegram или в Web'e.
          </p>
          <div class="cta-row">
            <a
              :href="tgBotUrl || '#how'"
              :target="tgBotUrl ? '_blank' : undefined"
              :rel="tgBotUrl ? 'noopener noreferrer' : undefined"
              class="cta-primary"
            >
              Попробовать
              <span class="cta-arrow" aria-hidden="true">→</span>
            </a>
            <a
              v-if="cabinetUrl"
              :href="cabinetUrl"
              class="cta-secondary"
            >
              Перейти в личный кабинет
              <span class="cta-arrow" aria-hidden="true">→</span>
            </a>
          </div>
          <p class="hero-note">
            Регистрация — в&nbsp;один тап через Telegram.
            Первое подключение бесплатно.
          </p>
        </div>
        <div class="hero-art">
          <img src="/logo.png" alt="" class="hero-logo" aria-hidden="true" />
        </div>
      </div>
    </section>

    <!-- Подсветка: web как альтернатива Telegram -->
    <section class="web-callout-section">
      <div class="container">
        <div class="web-callout">
          <div class="web-callout-icon" aria-hidden="true">🌐</div>
          <div class="web-callout-text">
            <strong>Telegram недоступен? Управляйте через веб-кабинет.</strong>
            Авторизоваться в сервисе нужно один раз — через бота. Дальше у&nbsp;вас
            личная ссылка на веб-кабинет: устройства, конфиги, оплата и&nbsp;баланс
            доступны в&nbsp;любом браузере, без Telegram.
          </div>
        </div>
      </div>
    </section>

    <!-- Возможности -->
    <section id="features" class="features-section">
      <div class="container">
        <h2 class="section-title">Почему cybernexvpn</h2>
        <p class="section-sub">
          Простой и честный VPN для тех, кто не хочет разбираться в&nbsp;настройках.
        </p>
        <div class="features-grid">
          <div v-for="f in features" :key="f.title" class="feature-card">
            <div class="feature-icon" aria-hidden="true">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Как это работает -->
    <section id="how" class="how-section">
      <div class="container">
        <h2 class="section-title">Как это работает</h2>
        <p class="section-sub">Три шага — и VPN уже на устройстве.</p>
        <div class="steps">
          <div v-for="s in steps" :key="s.n" class="step">
            <div class="step-num">{{ s.n }}</div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Финальный CTA -->
    <section class="final-cta">
      <div class="container final-inner">
        <div>
          <h2>Готовы попробовать?</h2>
          <p>Жмите кнопку — бот поможет всё настроить.</p>
        </div>
        <a
          :href="tgBotUrl || '#'"
          :target="tgBotUrl ? '_blank' : undefined"
          :rel="tgBotUrl ? 'noopener noreferrer' : undefined"
          class="cta-primary cta-big"
        >
          Попробовать
          <span class="cta-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </section>

    <!-- Подвал -->
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <img src="/logo.png" alt="" class="brand-logo small" aria-hidden="true" />
          <span>cybernexvpn</span>
        </div>
        <div class="footer-links">
          <a
            v-if="tgBotUrl"
            :href="tgBotUrl"
            target="_blank"
            rel="noopener noreferrer"
          >Telegram-бот</a>
          <a href="https://t.me/arseny_volodko" target="_blank" rel="noopener noreferrer">
            Поддержка
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  overflow: hidden;
}

/* Декоративные размытые круги */
.bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
}
.blob-1 {
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(142, 167, 180, 0.55), transparent 70%);
  top: -160px;
  right: -120px;
}
.blob-2 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(216, 205, 168, 0.7), transparent 70%);
  top: 320px;
  left: -120px;
}

/* Шапка */
.site-header {
  position: relative;
  z-index: 2;
  padding: 18px 0;
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: contain;
  background: var(--surface);
  padding: 4px;
  border: 1px solid var(--border);
}
.brand-logo.small { width: 28px; height: 28px; }
.brand-text {
  font-size: 1.05rem;
  color: var(--text);
}
.header-nav {
  display: inline-flex;
  align-items: center;
  gap: 22px;
}
.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.15s ease;
}
.nav-link:hover { color: var(--text); }
.nav-cta {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 14px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.nav-cta:hover {
  border-color: var(--accent-strong);
  color: var(--accent-strong);
}
.nav-cta-primary {
  background: var(--accent-strong);
  color: var(--accent-contrast);
  border-color: var(--accent-strong);
}
.nav-cta-primary:hover {
  background: var(--text);
  border-color: var(--text);
  color: var(--accent-contrast);
}

/* Hero */
.hero {
  position: relative;
  z-index: 1;
  padding: 72px 0 16px;
}
.hero-inner {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  /* low end alignment: bottom of the logo lines up with bottom of .hero-note */
  align-items: end;
  gap: 40px;
}
.badge {
  display: inline-block;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--accent-strong);
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
}
.hero h1 {
  font-size: clamp(2rem, 4.4vw, 3.4rem);
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: 0 0 18px;
  color: var(--text);
}
.lead {
  color: var(--muted);
  font-size: clamp(1rem, 1.6vw, 1.18rem);
  max-width: 580px;
  margin: 0 0 28px;
}
.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}
.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--accent-strong);
  color: var(--accent-contrast);
  border: none;
  padding: 14px 26px;
  border-radius: var(--radius);
  font-size: 1.02rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.05s ease, box-shadow 0.15s ease;
  box-shadow: 0 8px 22px rgba(111, 140, 155, 0.25);
}
.cta-primary:hover {
  background: var(--text);
  box-shadow: 0 10px 28px rgba(62, 79, 90, 0.28);
}
.cta-primary:active { transform: translateY(1px); }
.cta-arrow {
  transition: transform 0.15s ease;
}
.cta-primary:hover .cta-arrow { transform: translateX(3px); }
.cta-big {
  padding: 16px 32px;
  font-size: 1.08rem;
}

.cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 13px 22px;
  border-radius: var(--radius);
  font-size: 1rem;
  text-decoration: none;
  transition: border-color 0.15s ease, color 0.15s ease;
}
.cta-secondary:hover {
  border-color: var(--accent-strong);
  color: var(--accent-strong);
}
.hero-note {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0;
}

.hero-art {
  display: grid;
  place-items: center;
}
.hero-logo {
  width: 100%;
  max-width: 360px;
  filter: drop-shadow(0 18px 36px rgba(62, 79, 90, 0.18));
}

/* Общие заголовки секций */
.section-title {
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  margin: 0 0 8px;
  letter-spacing: -0.015em;
  color: var(--text);
}
.section-sub {
  color: var(--muted);
  margin: 0 0 32px;
  max-width: 620px;
}

/* Баннер про web-кабинет */
.web-callout-section {
  position: relative;
  z-index: 1;
  padding: 0 0 32px;
}
.web-callout {
  display: flex;
  align-items: center;
  gap: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent-strong);
  border-radius: var(--radius);
  padding: 18px 22px;
}
.web-callout-icon {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(142, 167, 180, 0.25), rgba(216, 205, 168, 0.45));
  font-size: 1.4rem;
}
.web-callout-text {
  color: var(--muted);
  font-size: 0.98rem;
  line-height: 1.45;
}
.web-callout-text strong {
  display: block;
  color: var(--text);
  font-weight: 600;
  margin-bottom: 2px;
}

/* Возможности */
.features-section {
  position: relative;
  z-index: 1;
  padding: 32px 0 56px;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.feature-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 22px;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.feature-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 10px 24px rgba(62, 79, 90, 0.08);
}
.feature-icon {
  font-size: 1.6rem;
  margin-bottom: 8px;
}
.feature-card h3 {
  margin: 0 0 6px;
  font-size: 1.08rem;
  color: var(--text);
}
.feature-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

/* Как это работает */
.how-section {
  position: relative;
  z-index: 1;
  padding: 32px 0 56px;
}
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.step {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  position: relative;
}
.step-num {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--accent-strong);
  color: var(--accent-contrast);
  font-weight: 600;
  margin-bottom: 12px;
}
.step h3 {
  margin: 0 0 6px;
  font-size: 1.08rem;
  color: var(--text);
}
.step p {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

/* Финальный CTA */
.final-cta {
  position: relative;
  z-index: 1;
  padding: 24px 0 64px;
}
.final-inner {
  background: linear-gradient(135deg, rgba(142, 167, 180, 0.18), rgba(216, 205, 168, 0.4));
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 4px);
  padding: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.final-inner h2 {
  margin: 0 0 6px;
  font-size: clamp(1.4rem, 2.4vw, 1.8rem);
  color: var(--text);
}
.final-inner p {
  margin: 0;
  color: var(--muted);
}

/* Подвал */
.site-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--border);
  padding: 20px 0 28px;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  font-weight: 500;
}
.footer-links {
  display: inline-flex;
  gap: 18px;
}
.footer-links a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
}
.footer-links a:hover { color: var(--text); }

/* Адаптив */
@media (max-width: 960px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .steps { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .hero { padding: 48px 0 40px; }
  .hero-inner { grid-template-columns: 1fr; }
  .hero-art { order: -1; }
  .hero-logo { max-width: 200px; }
  .features-grid { grid-template-columns: 1fr; }
  .header-nav { gap: 14px; }
  .nav-link { display: none; }
  .final-inner { padding: 24px; }
  .web-callout { padding: 16px; gap: 14px; }
  .web-callout-icon { width: 36px; height: 36px; font-size: 1.15rem; border-radius: 10px; }
}
</style>