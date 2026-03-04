import { normalizeTimestamp } from "@/utils/date";
import { categoryFromTmdbGenres } from "@/constants/movieCategories";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const LOCAL_MOVIES_ENDPOINT = "/movies.json";
const FALLBACK_POSTER_URL = "https://placehold.co/500x750/0f172a/e2e8f0?text=Sem+Poster";
const FALLBACK_BACKDROP_URL =
  "https://placehold.co/1280x720/0f172a/e2e8f0?text=Imagem+indisponivel";
const FALLBACK_PROFILE_URL = "https://placehold.co/300x450/0f172a/e2e8f0?text=Sem+Foto";
const FALLBACK_PROVIDER_LOGO_URL =
  "https://placehold.co/184x92/0f172a/e2e8f0?text=Streaming";
const DEFAULT_LANGUAGE = getSanitizedEnvValue(process.env.VUE_APP_TMDB_LANGUAGE) ?? "pt-BR";
const DEFAULT_REGION = getSanitizedEnvValue(process.env.VUE_APP_TMDB_REGION) ?? "BR";
const TMDB_READ_TOKEN = getSanitizedEnvValue(process.env.VUE_APP_TMDB_API_READ_TOKEN);
const TMDB_API_KEY = getSanitizedEnvValue(process.env.VUE_APP_TMDB_API_KEY);
const DISCOVER_PAGES = clampNumber(
  process.env.VUE_APP_TMDB_DISCOVER_PAGES,
  1,
  5,
  3,
);

const moviesCache = new Map();
const movieDetailsCache = new Map();
const localMoviesCache = new Map();

function getSanitizedEnvValue(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return "";
  }

  const lowered = trimmed.toLowerCase();

  if (
    lowered.includes("insira_seu_token") ||
    lowered.includes("opcional_chave") ||
    lowered.includes("seu_token_tmdb")
  ) {
    return "";
  }

  return trimmed;
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsed));
}

function normalizeRating(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(10, Math.max(0, Math.round(numericValue * 10) / 10));
}

function parseReleaseDate(rawDate) {
  if (!rawDate) {
    return null;
  }

  const parsed = Date.parse(rawDate);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return normalizeTimestamp(parsed);
}

function buildImageUrl(path, size = "w500", fallbackUrl = FALLBACK_POSTER_URL) {
  if (!path) {
    return fallbackUrl;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

function parseGenreIds(movie) {
  if (Array.isArray(movie.genre_ids)) {
    return movie.genre_ids;
  }

  if (Array.isArray(movie.genres)) {
    return movie.genres
      .map((genre) => Number(genre.id))
      .filter((genreId) => Number.isFinite(genreId));
  }

  return [];
}

function normalizeMovie(movie) {
  const genreIds = parseGenreIds(movie);

  return {
    id: String(movie.id),
    title: String(movie.title ?? "Titulo indisponivel"),
    description: String(
      movie.overview?.trim() || "Descricao indisponivel para este filme.",
    ),
    image: buildImageUrl(movie.poster_path, "w500", FALLBACK_POSTER_URL),
    backdropImage: buildImageUrl(
      movie.backdrop_path,
      "w780",
      FALLBACK_BACKDROP_URL,
    ),
    trailer: "",
    rating: normalizeRating(movie.vote_average),
    category: categoryFromTmdbGenres(genreIds),
    releaseDate: parseReleaseDate(movie.release_date),
  };
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function hasTmdbCredentials() {
  return Boolean(TMDB_READ_TOKEN || TMDB_API_KEY);
}

function normalizeLegacyCategory(category) {
  const value = normalizeText(category).toUpperCase();

  if (!value) {
    return "OTHER";
  }

  const legacyToCurrent = {
    SUSPENSE: "THRILLER",
    TERROR: "HORROR",
    DOCUMENTARIO: "DOCUMENTARY",
    FICCAO_CIENTIFICA: "SCIENCE_FICTION",
  };

  return legacyToCurrent[value] ?? value;
}

function createDefaultMovieDetails() {
  return {
    tagline: "",
    runtime: null,
    status: "Disponivel no catalogo local",
    originalTitle: "",
    originalLanguage: "",
    voteCount: 0,
    popularity: 0,
    budget: 0,
    revenue: 0,
    genres: [],
    spokenLanguages: [],
    productionCountries: [],
    productionCompanies: [],
    certification: "",
    directors: [],
    writers: [],
    cast: [],
    watchProviders: {
      link: "",
      flatrate: [],
      rent: [],
      buy: [],
    },
  };
}

function normalizeLocalMovie(movie, index) {
  const title = normalizeText(movie.title) || "Titulo indisponivel";
  const baseMovie = {
    id: String(movie.id ?? index + 1),
    title,
    description:
      normalizeText(movie.description) ||
      "Descricao indisponivel para este filme.",
    image: normalizeText(movie.image) || FALLBACK_POSTER_URL,
    backdropImage: normalizeText(movie.backdropImage) || FALLBACK_BACKDROP_URL,
    trailer: normalizeText(movie.trailer),
    rating: normalizeRating(movie.rating),
    category: normalizeLegacyCategory(movie.category),
    releaseDate: normalizeTimestamp(movie.releaseDate ?? movie.release_date),
  };

  return {
    ...baseMovie,
    ...createDefaultMovieDetails(),
    originalTitle: normalizeText(movie.originalTitle) || title,
    originalLanguage: normalizeText(movie.originalLanguage).toUpperCase(),
  };
}

function normalizeListNames(payload, valueGetter) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => normalizeText(valueGetter(item)))
    .filter(Boolean);
}

function normalizeWatchProviderItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const providers = items.map((provider) => ({
    id: String(provider.provider_id ?? ""),
    name: normalizeText(provider.provider_name) || "Plataforma",
    logo: buildImageUrl(
      provider.logo_path,
      "w185",
      FALLBACK_PROVIDER_LOGO_URL,
    ),
  }));

  const uniqueProviders = [];
  const seenProviderIds = new Set();

  for (const provider of providers) {
    if (!provider.id || seenProviderIds.has(provider.id)) {
      continue;
    }

    seenProviderIds.add(provider.id);
    uniqueProviders.push(provider);
  }

  return uniqueProviders;
}

function normalizeWatchProviders(countryNode) {
  if (!countryNode || typeof countryNode !== "object") {
    return {
      link: "",
      flatrate: [],
      rent: [],
      buy: [],
    };
  }

  return {
    link: normalizeText(countryNode.link),
    flatrate: normalizeWatchProviderItems(countryNode.flatrate),
    rent: normalizeWatchProviderItems(countryNode.rent),
    buy: normalizeWatchProviderItems(countryNode.buy),
  };
}

function pickCertification(releaseDatesResults) {
  if (!Array.isArray(releaseDatesResults)) {
    return "";
  }

  const searchOrder = [
    DEFAULT_REGION,
    "US",
  ];

  for (const regionCode of searchOrder) {
    const regionNode = releaseDatesResults.find(
      (item) => item?.iso_3166_1 === regionCode,
    );

    if (!Array.isArray(regionNode?.release_dates)) {
      continue;
    }

    const certification = regionNode.release_dates
      .map((item) => normalizeText(item?.certification))
      .find(Boolean);

    if (certification) {
      return certification;
    }
  }

  return "";
}

function normalizeCrewNames(crew, acceptedJobs) {
  if (!Array.isArray(crew)) {
    return [];
  }

  const entries = crew
    .filter((person) => acceptedJobs.includes(person?.job))
    .map((person) => normalizeText(person?.name))
    .filter(Boolean);

  return Array.from(new Set(entries));
}

function normalizeCast(cast) {
  if (!Array.isArray(cast)) {
    return [];
  }

  return cast
    .slice()
    .sort((left, right) => (left.order ?? 999) - (right.order ?? 999))
    .slice(0, 12)
    .map((person) => ({
      id: String(person.id ?? ""),
      name: normalizeText(person.name) || "Ator(a)",
      character: normalizeText(person.character) || "Sem personagem informado",
      profileImage: buildImageUrl(
        person.profile_path,
        "w185",
        FALLBACK_PROFILE_URL,
      ),
    }))
    .filter((person) => person.id && person.name);
}

function normalizeMovieDetails(payload) {
  const baseMovie = normalizeMovie(payload);
  const watchProvidersByRegion = payload?.["watch/providers"]?.results?.[DEFAULT_REGION];

  return {
    ...baseMovie,
    trailer: pickBestTrailer(payload?.videos?.results),
    tagline: normalizeText(payload.tagline),
    runtime: Number.isFinite(payload.runtime) ? payload.runtime : null,
    status: normalizeText(payload.status),
    originalTitle: normalizeText(payload.original_title),
    originalLanguage: normalizeText(payload.original_language).toUpperCase(),
    voteCount: Number.isFinite(payload.vote_count) ? payload.vote_count : 0,
    popularity: Number.isFinite(payload.popularity)
      ? Math.round(payload.popularity * 10) / 10
      : 0,
    budget: Number.isFinite(payload.budget) ? payload.budget : 0,
    revenue: Number.isFinite(payload.revenue) ? payload.revenue : 0,
    genres: normalizeListNames(payload.genres, (item) => item?.name),
    spokenLanguages: normalizeListNames(
      payload.spoken_languages,
      (item) => item?.english_name ?? item?.name,
    ),
    productionCountries: normalizeListNames(
      payload.production_countries,
      (item) => item?.name,
    ),
    productionCompanies: normalizeListNames(
      payload.production_companies,
      (item) => item?.name,
    ),
    certification: pickCertification(payload?.release_dates?.results),
    directors: normalizeCrewNames(payload?.credits?.crew, [
      "Director",
    ]),
    writers: normalizeCrewNames(payload?.credits?.crew, [
      "Writer",
      "Screenplay",
      "Story",
    ]),
    cast: normalizeCast(payload?.credits?.cast),
    watchProviders: normalizeWatchProviders(watchProvidersByRegion),
  };
}

function pickBestTrailer(videosPayload) {
  if (!Array.isArray(videosPayload)) {
    return "";
  }

  const candidates = videosPayload.filter(
    (video) => video.site === "YouTube" && typeof video.key === "string" && video.key,
  );

  if (candidates.length === 0) {
    return "";
  }

  let selectedTrailer = candidates[0];
  let selectedScore = -1;

  for (const trailer of candidates) {
    let score = 0;

    if (trailer.type === "Trailer") score += 3;
    if (trailer.official) score += 2;
    if (trailer.iso_639_1 === "pt") score += 2;
    if (trailer.iso_3166_1 === "BR") score += 1;
    if (trailer.iso_639_1 === "en") score += 1;

    if (score > selectedScore) {
      selectedScore = score;
      selectedTrailer = trailer;
    }
  }

  return `https://www.youtube.com/watch?v=${selectedTrailer.key}`;
}

function withErrorStatus(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function ensureTmdbCredentials() {
  if (!TMDB_READ_TOKEN && !TMDB_API_KEY) {
    throw new Error(
      "Configure VUE_APP_TMDB_API_READ_TOKEN ou VUE_APP_TMDB_API_KEY para consumir a API do TMDB.",
    );
  }
}

async function requestTmdb(path, params = {}) {
  ensureTmdbCredentials();

  const buildUrl = (useBearerToken) => {
    const url = new URL(`${TMDB_API_BASE_URL}${path}`);
    const queryParams = {
      language: DEFAULT_LANGUAGE,
      region: DEFAULT_REGION,
      ...(useBearerToken ? {} : { api_key: TMDB_API_KEY }),
      ...params,
    };

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  };

  const fetchWithAuthMode = (useBearerToken) =>
    fetch(buildUrl(useBearerToken), {
      headers: {
        ...(useBearerToken ? { Authorization: `Bearer ${TMDB_READ_TOKEN}` } : {}),
        accept: "application/json",
      },
    });

  const shouldTryBearer = Boolean(TMDB_READ_TOKEN);
  let response = await fetchWithAuthMode(shouldTryBearer);

  if (response.status === 401 && shouldTryBearer && TMDB_API_KEY) {
    response = await fetchWithAuthMode(false);
  }

  if (!response.ok) {
    let message = "Falha ao consultar a API do TMDB.";

    try {
      const payload = await response.json();

      if (payload?.status_message) {
        message = payload.status_message;
      }
    } catch (_error) {
      // Keep default message when body is unavailable.
    }

    throw withErrorStatus(message, response.status);
  }

  return response.json();
}

async function getDiscoverMoviesPage(page) {
  const payload = await requestTmdb("/discover/movie", {
    page,
    include_adult: false,
    include_video: false,
    sort_by: "popularity.desc",
    "vote_count.gte": 200,
  });

  if (!Array.isArray(payload.results)) {
    throw new Error("Formato inesperado de resposta para o catalogo de filmes.");
  }

  return payload.results.map(normalizeMovie);
}

async function getLocalMovies({ forceRefresh = false } = {}) {
  const cacheKey = "local";

  if (localMoviesCache.has(cacheKey) && !forceRefresh) {
    return localMoviesCache.get(cacheKey);
  }

  const response = await fetch(LOCAL_MOVIES_ENDPOINT);

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o catalogo local.");
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("Formato invalido do arquivo movies.json.");
  }

  const localMovies = payload.map(normalizeLocalMovie);
  localMoviesCache.set(cacheKey, localMovies);
  return localMovies;
}

export async function getMovies({ forceRefresh = false } = {}) {
  if (!hasTmdbCredentials()) {
    return getLocalMovies({ forceRefresh });
  }

  const cacheKey = `${DEFAULT_LANGUAGE}:${DEFAULT_REGION}:${DISCOVER_PAGES}`;

  if (moviesCache.has(cacheKey) && !forceRefresh) {
    return moviesCache.get(cacheKey);
  }

  try {
    const pageIndexes = Array.from(
      { length: DISCOVER_PAGES },
      (_value, index) => index + 1,
    );
    const pages = await Promise.all(pageIndexes.map((page) => getDiscoverMoviesPage(page)));

    const mergedMovies = [];
    const seenIds = new Set();

    for (const page of pages) {
      for (const movie of page) {
        if (seenIds.has(movie.id)) {
          continue;
        }

        seenIds.add(movie.id);
        mergedMovies.push(movie);
      }
    }

    moviesCache.set(cacheKey, mergedMovies);
    return mergedMovies;
  } catch (error) {
    const fallbackMovies = await getLocalMovies({ forceRefresh }).catch(() => null);

    if (fallbackMovies?.length) {
      return fallbackMovies;
    }

    throw error;
  }
}

export async function getMovieById(id, options = {}) {
  const normalizedId = String(id);

  if (!hasTmdbCredentials()) {
    const localMovies = await getLocalMovies(options);
    return localMovies.find((movie) => movie.id === normalizedId) ?? null;
  }

  if (movieDetailsCache.has(normalizedId) && !options.forceRefresh) {
    return movieDetailsCache.get(normalizedId);
  }

  try {
    const payload = await requestTmdb(`/movie/${normalizedId}`, {
      append_to_response: "videos,credits,release_dates,watch/providers",
    });

    const movie = normalizeMovieDetails(payload);

    movieDetailsCache.set(normalizedId, movie);
    return movie;
  } catch (error) {
    if (error?.status === 404) {
      return null;
    }

    const localMovies = await getLocalMovies(options).catch(() => null);

    if (localMovies) {
      return localMovies.find((movie) => movie.id === normalizedId) ?? null;
    }

    throw error;
  }
}
