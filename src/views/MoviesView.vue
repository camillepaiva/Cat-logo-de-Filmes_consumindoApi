<template>
  <main class="page-container">
    <AppHeader :total-movies="movies.length" :favorite-movies="favoritesCount" />

    <section class="surface-panel filters-panel">
      <MovieFilters
        :search="search"
        :category="category"
        :sort-by="sortBy"
        :favorites-only="favoritesOnly"
        @update:search="search = $event"
        @update:category="category = $event"
        @update:sort-by="sortBy = $event"
        @update:favorites-only="favoritesOnly = $event"
      />
    </section>

    <section v-if="isLoading" class="state-block">
      <BaseLoader label="Carregando catalogo..." />
    </section>

    <section v-else-if="errorMessage" class="state-block">
      <EmptyState
        title="Falha ao carregar catalogo"
        :description="errorMessage"
        action-label="Tentar novamente"
        @action="loadMovies({ forceRefresh: true })"
      />
    </section>

    <section v-else-if="filteredMovies.length === 0" class="state-block">
      <EmptyState
        title="Nenhum filme encontrado"
        description="Ajuste os filtros para encontrar mais titulos."
      />
    </section>

    <section v-else class="movies-grid">
      <MovieCard
        v-for="movie in filteredMovies"
        :key="movie.id"
        :movie="movie"
        @toggle-favorite="toggleFavorite"
      />
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import MovieCard from "@/components/MovieCard.vue";
import MovieFilters from "@/components/MovieFilters.vue";
import BaseLoader from "@/components/base/BaseLoader.vue";
import EmptyState from "@/components/base/EmptyState.vue";
import { useMovies } from "@/composables/useMovies";

const { movies, isLoading, errorMessage, favoritesCount, loadMovies, toggleFavorite } =
  useMovies();

const search = ref("");
const category = ref("");
const sortBy = ref("release_desc");
const favoritesOnly = ref(false);

const sortStrategies = {
  release_desc: (left, right) => (right.releaseDate ?? 0) - (left.releaseDate ?? 0),
  rating_desc: (left, right) => right.rating - left.rating,
  title_asc: (left, right) => left.title.localeCompare(right.title, "pt-BR"),
};

const filteredMovies = computed(() => {
  const normalizedSearch = search.value.trim().toLowerCase();

  const filtered = movies.value.filter((movie) => {
    if (
      normalizedSearch &&
      !`${movie.title} ${movie.description}`.toLowerCase().includes(normalizedSearch)
    ) {
      return false;
    }

    if (category.value && movie.category !== category.value) {
      return false;
    }

    if (favoritesOnly.value && !movie.isFavorite) {
      return false;
    }

    return true;
  });

  const sorter = sortStrategies[sortBy.value] ?? sortStrategies.release_desc;
  return [...filtered].sort(sorter);
});

onMounted(() => {
  loadMovies();
});
</script>

<style scoped>
.filters-panel {
  margin-bottom: 1.35rem;
}

.state-block {
  margin-top: 1rem;
}

.movies-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
</style>
