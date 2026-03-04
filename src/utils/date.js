const MIN_MILLISECONDS_TIMESTAMP = 1000000000000;

export function normalizeTimestamp(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  if (numericValue < MIN_MILLISECONDS_TIMESTAMP) {
    return numericValue * 1000;
  }

  return numericValue;
}

export function formatReleaseDate(value, locale = "pt-BR") {
  const timestamp = normalizeTimestamp(value);

  if (!timestamp) {
    return "Data indisponivel";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(new Date(timestamp));
}
