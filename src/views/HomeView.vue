<script setup>
import { ref } from 'vue'

const features = [
  { title: 'Быстро', text: 'Серверы с низкой задержкой, WireGuard под капотом.' },
  { title: 'Безопасно', text: 'Шифрование трафика и никаких логов активности.' },
  { title: 'Просто', text: 'Оплата и подключение — за пару минут.' },
]

const clicks = ref(0)
</script>

<template>
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-copy">
        <h1>VPN, которому можно доверять</h1>
        <p class="lead">
          Приватный трафик, быстрые серверы, оплата в рублях. Для телефона и ПК.
        </p>
        <button class="cta" @click="clicks++">
          Попробовать {{ clicks ? `(нажато ${clicks}×)` : '' }}
        </button>
      </div>
      <img src="/logo.png" alt="" class="hero-logo" aria-hidden="true" />
    </div>
  </section>

  <section id="features" class="features container">
    <div v-for="f in features" :key="f.title" class="card">
      <h3>{{ f.title }}</h3>
      <p>{{ f.text }}</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 64px 0 48px;
  background: radial-gradient(900px 360px at 75% -40px, rgba(142, 167, 180, 0.35), transparent);
}
.hero-inner {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  align-items: center;
  gap: 32px;
}
.hero h1 {
  font-size: clamp(1.8rem, 4vw, 3rem);
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  color: var(--text);
}
.lead {
  color: var(--muted);
  font-size: clamp(1rem, 2vw, 1.2rem);
  max-width: 560px;
  margin: 0 0 24px;
}
.hero-logo {
  width: 100%;
  max-width: 320px;
  justify-self: end;
  filter: drop-shadow(0 10px 24px rgba(62, 79, 90, 0.15));
}
.cta {
  background: var(--accent-strong);
  color: var(--accent-contrast);
  border: none;
  padding: 12px 22px;
  border-radius: var(--radius);
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.05s ease;
}
.cta:hover { background: var(--text); }
.cta:active { transform: translateY(1px); }

.features {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
  padding-top: 24px;
  padding-bottom: 64px;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}
.card h3 { margin: 0 0 6px; font-size: 1.1rem; color: var(--text); }
.card p { margin: 0; color: var(--muted); }

@media (max-width: 860px) {
  .hero-inner { grid-template-columns: 1fr; }
  .hero-logo { justify-self: center; max-width: 220px; }
}
@media (max-width: 720px) {
  .features { grid-template-columns: 1fr; }
  .hero { padding: 40px 0 32px; }
}
</style>