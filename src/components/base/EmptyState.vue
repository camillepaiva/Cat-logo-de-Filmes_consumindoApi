<template>
  <div class="empty-state surface-panel" role="status">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <button v-if="actionLabel" type="button" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "Nada por aqui",
  },
  description: {
    type: String,
    default: "Nao encontramos dados para exibir no momento.",
  },
  actionLabel: {
    type: String,
    default: "",
  },
});

defineEmits(["action"]);
</script>

<style scoped>
.empty-state {
  min-height: 220px;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 0.6rem;
  padding: 1.5rem;
}

h2 {
  margin: 0;
}

p {
  margin: 0;
  color: var(--text-secondary);
  max-width: 560px;
}

button {
  justify-self: center;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  padding: 0.6rem 1.1rem;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}
</style>
