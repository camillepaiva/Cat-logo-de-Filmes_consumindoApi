export const CATEGORY_LABELS = Object.freeze({
  ACTION: "Acao",
  ADVENTURE: "Aventura",
  ANIMATION: "Animacao",
  COMEDY: "Comedia",
  CRIME: "Crime",
  DOCUMENTARY: "Documentario",
  DRAMA: "Drama",
  FAMILY: "Familia",
  FANTASY: "Fantasia",
  HISTORY: "Historia",
  HORROR: "Terror",
  MUSIC: "Musical",
  MYSTERY: "Misterio",
  ROMANCE: "Romance",
  SCIENCE_FICTION: "Ficcao cientifica",
  THRILLER: "Suspense",
  WAR: "Guerra",
  WESTERN: "Faroeste",
  OTHER: "Outros",
});

const TMDB_GENRE_CATEGORY_MAP = Object.freeze({
  12: "ADVENTURE",
  14: "FANTASY",
  16: "ANIMATION",
  18: "DRAMA",
  27: "HORROR",
  28: "ACTION",
  35: "COMEDY",
  36: "HISTORY",
  37: "WESTERN",
  53: "THRILLER",
  80: "CRIME",
  99: "DOCUMENTARY",
  878: "SCIENCE_FICTION",
  9648: "MYSTERY",
  10402: "MUSIC",
  10749: "ROMANCE",
  10751: "FAMILY",
  10752: "WAR",
});

export const CATEGORY_OPTIONS = Object.freeze(
  Object.keys(CATEGORY_LABELS).filter((categoryCode) => categoryCode !== "OTHER"),
);

export function getCategoryLabel(value) {
  return CATEGORY_LABELS[value] ?? CATEGORY_LABELS.OTHER;
}

export function categoryFromTmdbGenres(genreIds) {
  if (!Array.isArray(genreIds)) {
    return "OTHER";
  }

  for (const genreId of genreIds) {
    const categoryCode = TMDB_GENRE_CATEGORY_MAP[genreId];

    if (categoryCode) {
      return categoryCode;
    }
  }

  return "OTHER";
}
