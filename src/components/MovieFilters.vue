<template>
  <section class="filters">
    <label>
      Buscar
      <input
        :value="search"
        type="search"
        placeholder="Digite titulo ou descricao"
        @input="emit('update:search', $event.target.value)"
      />
    </label>

    <label>
      Categoria
      <select
        :value="category"
        @change="emit('update:category', $event.target.value)"
      >
        <option value="">Todas</option>
        <option
          v-for="categoryOption in CATEGORY_OPTIONS"
          :key="categoryOption"
          :value="categoryOption"
        >
          {{ getCategoryLabel(categoryOption) }}
        </option>
      </select>
    </label>

    <label>
      Ordenacao
      <select :value="sortBy" @change="emit('update:sort-by', $event.target.value)">
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="checkbox">
      <input
        :checked="favoritesOnly"
        type="checkbox"
        @change="emit('update:favorites-only', $event.target.checked)"
      />
      Mostrar apenas favoritos
    </label>
  </section>
</template>

<script setup>
import { CATEGORY_OPTIONS, getCategoryLabel } from "@/constants/movieCategories";

defineProps({
  search: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "",
  },
  sortBy: {
    type: String,
    default: "release_desc",
  },
  favoritesOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:search",
  "update:category",
  "update:sort-by",
  "update:favorites-only",
]);

const sortOptions = [
  {
    value: "release_desc",
    label: "Lancamentos mais novos",
  },
  {
    value: "rating_desc",
    label: "Melhor avaliacao",
  },
  {
    value: "title_asc",
    label: "Titulo A-Z",
  },
];
</script>

<style scoped>
.filters {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 1rem 1.2rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

input,
select {
  border-radius: 10px;
  border: 1px solid var(--stroke);
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-main);
  padding: 0.6rem 0.7rem;
}

input:focus,
select:focus {
  outline: 2px solid rgba(255, 127, 54, 0.45);
  outline-offset: 1px;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  grid-column: 1 / -1;
}

.checkbox input {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
