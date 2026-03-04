import { computed, ref } from "vue";
import { getMovies } from "@/services/moviesService";

const FAVORITES_STORAGE_KEY = "catalogo-filmes:favorites";

const movies = ref([]);
const loading = ref(false);
const error = ref("");
const initialized = ref(false);
const favoriteIds = ref(loadFavoriteIds());

function loadFavoriteIds() {
  try {
    const payload = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = payload ? JSON.parse(payload) : [];

    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (_error) {
    return [];
  }
}

function saveFavoriteIds(ids) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

function mapMoviesWithFavorites(list) {
  return list.map((movie) => ({
    ...movie,
    isFavorite: isMovieFavorite(movie.id),
  }));
}

function isMovieFavorite(id) {
  return favoriteIds.value.includes(String(id));
}

export function useMovies() {
  const movieItems = computed(() => mapMoviesWithFavorites(movies.value));

  async function loadMovies({ forceRefresh = false } = {}) {
    if (loading.value) {
      return;
    }

    if (initialized.value && !forceRefresh) {
      return;
    }

    loading.value = true;
    error.value = "";

    try {
      movies.value = await getMovies({ forceRefresh });
      initialized.value = true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Erro inesperado ao carregar filmes.";
    } finally {
      loading.value = false;
    }
  }

  function toggleFavorite(id) {
    const normalizedId = String(id);
    const alreadyFavorited = favoriteIds.value.includes(normalizedId);

    favoriteIds.value = alreadyFavorited
      ? favoriteIds.value.filter((itemId) => itemId !== normalizedId)
      : [...favoriteIds.value, normalizedId];

    saveFavoriteIds(favoriteIds.value);
  }

  return {
    movies: movieItems,
    isLoading: computed(() => loading.value),
    errorMessage: computed(() => error.value),
    favoritesCount: computed(() => favoriteIds.value.length),
    isMovieFavorite,
    loadMovies,
    toggleFavorite,
  };
}
