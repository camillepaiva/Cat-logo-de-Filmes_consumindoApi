<template>
  <main class="page-container">
    <button type="button" class="back-button" @click="goToHome">
      Voltar ao catalogo
    </button>

    <section v-if="isLoading" class="state-block">
      <BaseLoader label="Carregando detalhes do filme..." />
    </section>

    <section v-else-if="errorMessage" class="state-block">
      <EmptyState
        title="Nao foi possivel carregar este filme"
        :description="errorMessage"
        action-label="Tentar novamente"
        @action="loadMovie({ forceRefresh: true })"
      />
    </section>

    <section v-else-if="!movie" class="state-block">
      <EmptyState
        title="Filme nao encontrado"
        description="O item pode ter sido removido ou o link esta incorreto."
        action-label="Ir para inicio"
        @action="goToHome"
      />
    </section>

    <section v-else class="details-layout">
      <article class="surface-panel poster-panel">
        <img class="poster" :src="movie.image" :alt="`Poster do filme ${movie.title}`" />
        <button
          type="button"
          class="favorite-button"
          :aria-pressed="movieIsFavorite"
          :aria-label="
            movieIsFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
          "
          @click="toggleFavorite(movie.id)"
        >
          <img
            :src="movieIsFavorite ? favoriteOnIcon : favoriteOffIcon"
            alt=""
            aria-hidden="true"
          />
          {{ movieIsFavorite ? "Favorito" : "Favoritar" }}
        </button>

        <dl class="quick-facts">
          <div>
            <dt>Nota</dt>
            <dd>{{ movie.rating }}/10</dd>
          </div>
          <div>
            <dt>Votos</dt>
            <dd>{{ formatCompactNumber(movie.voteCount) }}</dd>
          </div>
          <div>
            <dt>Duracao</dt>
            <dd>{{ formatRuntime(movie.runtime) }}</dd>
          </div>
          <div>
            <dt>Classificacao</dt>
            <dd>{{ movie.certification || "Nao informada" }}</dd>
          </div>
        </dl>
      </article>

      <div class="content-column">
        <article class="surface-panel details-card">
          <h1>{{ movie.title }}</h1>
          <p v-if="movie.tagline" class="tagline">{{ movie.tagline }}</p>
          <p class="meta">
            {{ getCategoryLabel(movie.category) }}
            <span aria-hidden="true">|</span>
            {{ formatReleaseDate(movie.releaseDate) }}
            <span aria-hidden="true">|</span>
            {{ movie.status || "Status indisponivel" }}
          </p>
          <p class="description">{{ movie.description }}</p>

          <div v-if="movie.genres.length" class="chips-row">
            <span v-for="genre in movie.genres" :key="genre" class="chip">{{ genre }}</span>
          </div>

          <dl class="tech-grid">
            <div v-for="item in technicalItems" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </article>

        <article class="surface-panel providers-card">
          <h2>Onde assistir ({{ regionCode }})</h2>

          <div v-if="providerGroups.length" class="provider-groups">
            <section v-for="group in providerGroups" :key="group.key" class="provider-group">
              <h3>{{ group.title }}</h3>
              <div class="providers-list">
                <div
                  v-for="provider in group.items"
                  :key="`${group.key}-${provider.id}`"
                  class="provider-item"
                >
                  <img :src="provider.logo" :alt="`Logo ${provider.name}`" loading="lazy" />
                  <span>{{ provider.name }}</span>
                </div>
              </div>
            </section>
          </div>

          <p v-else class="section-empty">
            Nenhum provedor encontrado para esta regiao.
          </p>

          <a
            v-if="movie.watchProviders.link"
            class="watch-link"
            :href="movie.watchProviders.link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir pagina oficial de provedores
          </a>
        </article>

        <article class="surface-panel cast-card">
          <h2>Elenco principal</h2>

          <div v-if="movie.cast.length" class="cast-list">
            <article v-for="person in movie.cast" :key="person.id" class="cast-item">
              <img
                :src="person.profileImage"
                :alt="`Foto de ${person.name}`"
                loading="lazy"
              />
              <h3>{{ person.name }}</h3>
              <p>{{ person.character }}</p>
            </article>
          </div>

          <p v-else class="section-empty">Elenco indisponivel para este titulo.</p>
        </article>

        <article v-if="trailerEmbedUrl" class="surface-panel trailer-card">
          <h2>Trailer oficial</h2>
          <div class="trailer-frame">
            <iframe
              :src="trailerEmbedUrl"
              title="Trailer do filme"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </article>

        <article v-else class="surface-panel trailer-card">
          <h2>Trailer oficial</h2>
          <p>Trailer indisponivel para este titulo.</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import favoriteOffIcon from "@/assets/favoritoSimples.png";
import favoriteOnIcon from "@/assets/favoritoClicado.png";
import BaseLoader from "@/components/base/BaseLoader.vue";
import EmptyState from "@/components/base/EmptyState.vue";
import { getCategoryLabel } from "@/constants/movieCategories";
import { useMovies } from "@/composables/useMovies";
import { getMovieById } from "@/services/moviesService";
import { formatReleaseDate } from "@/utils/date";
import { getYoutubeEmbedUrl } from "@/utils/youtube";

const route = useRoute();
const router = useRouter();

const { toggleFavorite, isMovieFavorite } = useMovies();

const movie = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
let pendingRequestId = 0;

const movieId = computed(() => String(route.params.id ?? ""));
const movieIsFavorite = computed(() =>
  movie.value ? isMovieFavorite(movie.value.id) : false,
);
const trailerEmbedUrl = computed(() =>
  movie.value ? getYoutubeEmbedUrl(movie.value.trailer) : null,
);
const regionCode = computed(() => (process.env.VUE_APP_TMDB_REGION || "BR").toUpperCase());

const providerGroups = computed(() => {
  if (!movie.value?.watchProviders) {
    return [];
  }

  const groups = [
    {
      key: "flatrate",
      title: "Streaming",
      items: movie.value.watchProviders.flatrate ?? [],
    },
    {
      key: "rent",
      title: "Alugar",
      items: movie.value.watchProviders.rent ?? [],
    },
    {
      key: "buy",
      title: "Comprar",
      items: movie.value.watchProviders.buy ?? [],
    },
  ];

  return groups.filter((group) => Array.isArray(group.items) && group.items.length > 0);
});

const technicalItems = computed(() => {
  if (!movie.value) {
    return [];
  }

  return [
    {
      label: "Titulo original",
      value: movie.value.originalTitle || "Nao informado",
    },
    {
      label: "Idioma original",
      value: movie.value.originalLanguage || "Nao informado",
    },
    {
      label: "Direcao",
      value: formatNamesList(movie.value.directors),
    },
    {
      label: "Roteiro",
      value: formatNamesList(movie.value.writers),
    },
    {
      label: "Empresas",
      value: formatNamesList(movie.value.productionCompanies, 4),
    },
    {
      label: "Paises",
      value: formatNamesList(movie.value.productionCountries, 3),
    },
    {
      label: "Idiomas falados",
      value: formatNamesList(movie.value.spokenLanguages, 4),
    },
    {
      label: "Popularidade",
      value: formatPopularity(movie.value.popularity),
    },
    {
      label: "Orcamento",
      value: formatUsdCurrency(movie.value.budget),
    },
    {
      label: "Receita",
      value: formatUsdCurrency(movie.value.revenue),
    },
  ];
});

function formatCompactNumber(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatRuntime(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "Nao informado";
  }

  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatUsdCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "Nao informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNamesList(items, limit = 5) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Nao informado";
  }

  const visibleItems = items.slice(0, limit);
  const suffix = items.length > limit ? "..." : "";

  return `${visibleItems.join(", ")}${suffix}`;
}

function formatPopularity(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "Nao informado";
  }

  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
}

async function loadMovie({ forceRefresh = false } = {}) {
  if (!movieId.value) {
    movie.value = null;
    return;
  }

  const requestId = ++pendingRequestId;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const payload = await getMovieById(movieId.value, { forceRefresh });

    if (requestId !== pendingRequestId) {
      return;
    }

    movie.value = payload;
  } catch (error) {
    if (requestId !== pendingRequestId) {
      return;
    }

    movie.value = null;
    errorMessage.value =
      error instanceof Error ? error.message : "Erro ao carregar detalhes do filme.";
  } finally {
    if (requestId === pendingRequestId) {
      isLoading.value = false;
    }
  }
}

function goToHome() {
  router.push({ name: "home" });
}

onMounted(() => {
  loadMovie();
});

watch(movieId, () => {
  loadMovie();
});
</script>

<style scoped>
.back-button {
  border: 1px solid var(--stroke);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-main);
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.state-block {
  margin-top: 1rem;
}

.details-layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(240px, 320px) 1fr;
}

.poster-panel {
  padding: 1rem;
  align-self: start;
}

.poster {
  width: 100%;
  border-radius: 12px;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.favorite-button {
  margin-top: 0.9rem;
  width: 100%;
  border: 1px solid var(--stroke);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-main);
  padding: 0.6rem;
  cursor: pointer;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.favorite-button img {
  width: 1rem;
  height: 1rem;
}

.quick-facts {
  margin: 0.9rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.quick-facts div {
  margin: 0;
  border: 1px solid var(--stroke);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.55rem;
}

.quick-facts dt {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
}

.quick-facts dd {
  margin: 0.2rem 0 0;
  font-weight: 700;
  color: var(--accent-soft);
}

.content-column {
  display: grid;
  gap: 1rem;
}

.details-card,
.cast-card,
.providers-card,
.trailer-card {
  padding: 1.2rem;
}

h1,
h2,
h3 {
  margin-top: 0;
}

.tagline {
  margin: 0.3rem 0 0.5rem;
  color: var(--accent-soft);
  font-style: italic;
}

.meta {
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.description {
  margin: 0;
}

.chips-row {
  margin-top: 0.9rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--stroke);
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.tech-grid {
  margin: 1rem 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.tech-grid div {
  border: 1px solid var(--stroke);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.65rem;
}

.tech-grid dt {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.79rem;
}

.tech-grid dd {
  margin: 0.24rem 0 0;
  font-size: 0.93rem;
}

.provider-groups {
  display: grid;
  gap: 0.85rem;
}

.provider-group h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.providers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.provider-item {
  width: 110px;
  text-align: center;
}

.provider-item img {
  width: 100%;
  aspect-ratio: 2 / 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--stroke);
}

.provider-item span {
  margin-top: 0.35rem;
  display: block;
  font-size: 0.77rem;
  color: var(--text-secondary);
}

.watch-link {
  margin-top: 0.95rem;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--stroke);
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
  color: var(--accent-soft);
}

.cast-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.cast-item {
  border: 1px solid var(--stroke);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
}

.cast-item img {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.cast-item h3,
.cast-item p {
  margin: 0;
  padding: 0 0.55rem;
}

.cast-item h3 {
  font-size: 0.92rem;
  margin-top: 0.5rem;
}

.cast-item p {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  margin-bottom: 0.6rem;
}

.section-empty {
  margin: 0;
  color: var(--text-secondary);
}

.trailer-frame {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  padding-top: 56.25%;
}

.trailer-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 1024px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .details-layout {
    grid-template-columns: 1fr;
  }

  .provider-item {
    width: 96px;
  }
}
</style>
