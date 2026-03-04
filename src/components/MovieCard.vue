<template>
  <article class="movie-card surface-panel">
    <RouterLink
      class="poster-link"
      :to="{ name: 'movie-details', params: { id: movie.id } }"
    >
      <img
        class="poster"
        :src="movie.image"
        :alt="`Poster do filme ${movie.title}`"
        loading="lazy"
      />
    </RouterLink>

    <button
      type="button"
      class="favorite-button"
      :aria-pressed="movie.isFavorite"
      :aria-label="movie.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
      @click="$emit('toggle-favorite', movie.id)"
    >
      <img
        :src="movie.isFavorite ? favoriteOnIcon : favoriteOffIcon"
        alt=""
        aria-hidden="true"
      />
      <span class="sr-only">
        {{ movie.isFavorite ? "Filme favoritado" : "Filme nao favoritado" }}
      </span>
    </button>

    <div class="content">
      <h2>{{ movie.title }}</h2>
      <p class="meta">
        {{ getCategoryLabel(movie.category) }}
        <span aria-hidden="true">|</span>
        {{ formatReleaseDate(movie.releaseDate) }}
      </p>
      <p class="description">{{ movie.description }}</p>
      <p class="rating">Nota {{ movie.rating }}/10</p>
    </div>
  </article>
</template>

<script setup>
import favoriteOffIcon from "@/assets/favoritoSimples.png";
import favoriteOnIcon from "@/assets/favoritoClicado.png";
import { getCategoryLabel } from "@/constants/movieCategories";
import { formatReleaseDate } from "@/utils/date";

defineProps({
  movie: {
    type: Object,
    required: true,
  },
});

defineEmits(["toggle-favorite"]);
</script>

<style scoped>
.movie-card {
  overflow: hidden;
  position: relative;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.movie-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 127, 54, 0.6);
}

.poster-link {
  display: block;
}

.poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.favorite-button {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--stroke);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-content: center;
  cursor: pointer;
}

.favorite-button img {
  width: 1.2rem;
  height: 1.2rem;
}

.content {
  padding: 0.95rem 1rem 1.15rem;
}

h2 {
  margin: 0;
  font-size: 1.12rem;
}

.meta {
  margin: 0.45rem 0 0.7rem;
  color: var(--text-secondary);
  font-size: 0.82rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
}

.description {
  margin: 0;
  color: #dce4f8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rating {
  margin: 0.8rem 0 0;
  color: var(--accent-soft);
  font-weight: 700;
}
</style>
