const EMBED_PREFIX = "https://www.youtube.com/embed/";

function sanitizeVideoId(videoId) {
  const candidate = String(videoId ?? "").trim();
  return /^[\w-]{11}$/.test(candidate) ? candidate : null;
}

export function getYoutubeEmbedUrl(sourceUrl) {
  if (!sourceUrl) {
    return null;
  }

  try {
    const url = new URL(sourceUrl);
    const host = url.hostname.replace("www.", "");
    let videoId = null;

    if (host === "youtu.be") {
      videoId = url.pathname.slice(1);
    } else if (host === "youtube.com") {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else if (url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/")[2];
      } else if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/")[2];
      }
    }

    const safeVideoId = sanitizeVideoId(videoId);
    return safeVideoId ? `${EMBED_PREFIX}${safeVideoId}` : null;
  } catch (_error) {
    return null;
  }
}
