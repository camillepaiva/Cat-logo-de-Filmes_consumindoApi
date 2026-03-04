const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const ALLOWED_ROOTS = new Set(["discover", "movie"]);

function sanitizeEnvValue(value) {
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

function getServerCredential(name) {
  return sanitizeEnvValue(process.env[name]);
}

function normalizePathSegments(pathParam) {
  const rawSegments = Array.isArray(pathParam) ? pathParam : [pathParam];

  return rawSegments
    .filter(Boolean)
    .map((segment) => String(segment).replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
}

function buildQueryString(query) {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (key === "path" || value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function parseResponseBody(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch (_error) {
    return text;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const readToken =
    getServerCredential("TMDB_API_READ_TOKEN") ||
    getServerCredential("VUE_APP_TMDB_API_READ_TOKEN");
  const apiKey =
    getServerCredential("TMDB_API_KEY") ||
    getServerCredential("VUE_APP_TMDB_API_KEY");

  if (!readToken && !apiKey) {
    sendJson(res, 500, {
      error:
        "TMDB credentials are missing. Configure TMDB_API_READ_TOKEN or TMDB_API_KEY in Vercel.",
    });
    return;
  }

  const pathSegments = normalizePathSegments(req.query.path);

  if (!pathSegments.length) {
    sendJson(res, 400, { error: "Missing TMDB path." });
    return;
  }

  if (!ALLOWED_ROOTS.has(pathSegments[0])) {
    sendJson(res, 403, { error: "TMDB path is not allowed." });
    return;
  }

  const requestPath = pathSegments.join("/");

  const buildUrl = (useBearerToken) => {
    const queryString = buildQueryString(req.query);
    const url = new URL(`${TMDB_API_BASE_URL}/${requestPath}`);

    if (queryString) {
      const query = new URLSearchParams(queryString);
      query.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }

    if (!useBearerToken && apiKey) {
      url.searchParams.set("api_key", apiKey);
    }

    return url.toString();
  };

  const fetchTmdb = (useBearerToken) =>
    fetch(buildUrl(useBearerToken), {
      headers: {
        ...(useBearerToken ? { Authorization: `Bearer ${readToken}` } : {}),
        accept: "application/json",
      },
    });

  const shouldTryBearer = Boolean(readToken);
  let response = await fetchTmdb(shouldTryBearer);

  if (response.status === 401 && shouldTryBearer && apiKey) {
    response = await fetchTmdb(false);
  }

  const body = await parseResponseBody(response);

  if (!response.ok) {
    const errorMessage =
      (body && typeof body === "object" && (body.status_message || body.error)) ||
      "TMDB request failed.";

    sendJson(res, response.status, {
      error: errorMessage,
      status: response.status,
    });
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.end(JSON.stringify(body ?? {}));
};
