<template>
  <div class="loader-wrap" role="status" aria-live="polite">
    <span class="loader" aria-hidden="true"></span>
    <p>{{ label }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: "Carregando...",
  },
});
</script>

<style scoped>
.loader-wrap {
  min-height: 220px;
  display: grid;
  place-content: center;
  gap: 0.85rem;
  text-align: center;
  color: var(--text-secondary);
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
