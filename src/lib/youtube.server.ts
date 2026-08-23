export type StudyVideo = {
  id: string;
  title: string;
  channel: string;
  duration: string | null;
};

const cache = new Map<string, { at: number; videos: StudyVideo[] }>();
const TTL_MS = 1000 * 60 * 60 * 6;

function decode(text: string) {
  return text
    .replace(/\\u0026/g, "&")
    .replace(/\\"/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Scrape YouTube search results for study videos matching a query. */
export async function searchStudyVideos(query: string, limit = 6): Promise<StudyVideo[]> {
  const key = `${query}::${limit}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.videos;

  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) return [];
  const html = await res.text();

  const videos: StudyVideo[] = [];
  const seen = new Set<string>();
  const blocks = html.split('"videoRenderer":{');
  for (const block of blocks.slice(1)) {
    const chunk = block.slice(0, 2500);
    const id = /^"videoId":"([\w-]{11})"/.exec(chunk)?.[1];
    if (!id || seen.has(id)) continue;
    const title =
      /"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/.exec(chunk)?.[1] ??
      /"title":\{"simpleText":"((?:[^"\\]|\\.)*)"/.exec(chunk)?.[1];
    if (!title) continue;
    const channel =
      /"ownerText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/.exec(chunk)?.[1] ??
      /"longBylineText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/.exec(chunk)?.[1] ??
      "YouTube";
    const duration = /"lengthText":\{[^}]*"simpleText":"([^"]+)"/.exec(chunk)?.[1] ?? null;
    seen.add(id);
    videos.push({ id, title: decode(title), channel: decode(channel), duration });
    if (videos.length >= limit) break;
  }

  if (videos.length) cache.set(key, { at: Date.now(), videos });
  return videos;
}
