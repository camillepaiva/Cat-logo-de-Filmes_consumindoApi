<template>
  <header class="header surface-panel">
    <div class="copy">
      <p class="eyebrow">Selecao Curada</p>
      <h1>Catalogo de Filmes</h1>
      <p class="subtitle">
        Explore titulos, marque favoritos e acompanhe detalhes completos.
      </p>
    </div>
    <div class="stats">
      <div>
        <span>Total</span>
        <strong>{{ totalMovies }}</strong>
      </div>
      <div>
        <span>Favoritos</span>
        <strong>{{ favoriteMovies }}</strong>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  totalMovies: {
    type: Number,
    default: 0,
  },
  favoriteMovies: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.copy h1 {
  margin: 0;
  font-family: "Bebas Neue", "Arial Narrow", sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.1rem);
  letter-spacing: 0.05em;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: var(--accent-soft);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.78rem;
}

.subtitle {
  margin: 0.45rem 0 0;
  color: var(--text-secondary);
  max-width: 580px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(80px, 1fr));
  gap: 0.75rem;
  align-self: center;
}

.stats div {
  border: 1px solid var(--stroke);
  border-radius: 12px;
  padding: 0.65rem 0.9rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.04);
}

.stats span {
  display: block;
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stats strong {
  display: block;
  margin-top: 0.2rem;
  color: var(--accent-soft);
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
