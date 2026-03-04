<template>
  <main class="page-container">
    <section class="surface-panel not-found">
      <p class="status">404</p>
      <h1>Pagina nao encontrada</h1>
      <p>O endereco informado nao existe neste catalogo.</p>
      <RouterLink class="back-home" :to="{ name: 'home' }">
        Voltar para inicio
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 0.5rem;
  padding: 1.4rem;
}

.status {
  margin: 0;
  font-size: clamp(4rem, 15vw, 8rem);
  font-family: "Bebas Neue", "Arial Narrow", sans-serif;
  line-height: 0.9;
  color: rgba(255, 127, 54, 0.9);
}

h1 {
  margin: 0;
}

p {
  margin: 0;
  color: var(--text-secondary);
}

.back-home {
  justify-self: center;
  margin-top: 0.5rem;
  border: 1px solid var(--stroke);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
}
</style>
