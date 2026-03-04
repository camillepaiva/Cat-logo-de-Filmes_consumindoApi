<template>
  <div class="app-root">
    <RouterView />
    <footer class="tmdb-attribution">
      Dados de filmes fornecidos por
      <a
        href="https://www.themoviedb.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        TMDB
      </a>
      . Este produto nao e endossado pelo TMDB.
    </footer>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
}

.tmdb-attribution {
  padding: 0.9rem 1rem 1.3rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.tmdb-attribution a {
  color: var(--accent-soft);
  font-weight: 700;
}
</style>
