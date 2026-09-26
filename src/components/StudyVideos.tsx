import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Loader2, Play, Youtube } from "lucide-react";
import { getStudyVideos } from "@/lib/youtube.functions";
import { VideoPlayerOverlay } from "@/components/VideoPlayerOverlay";

type Video = { id: string; title: string; channel: string; duration: string | null };

export function StudyVideos({
  query,
  label = "Study videos",
  chapterLabel,
  onPlay,
}: {
  query: string;
  label?: string;
  /** Shown above the title inside the fullscreen player. */
  chapterLabel?: string;
  /** Fired the first time a video from this list is opened. */
  onPlay?: () => void;
}) {
  const fetchVideos = useServerFn(getStudyVideos);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next || videos || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchVideos({ data: { query, limit: 6 } });
      setVideos(result.videos);
      if (!result.videos.length) setError(result.error ?? "No videos found for this topic yet.");
    } catch {
      setError("Could not load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/30">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-destructive" />
          {label}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-2 border-t border-border px-3 py-3">
          {loading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching YouTube lectures…
            </p>
          )}

          {!loading && error && <p className="text-sm text-muted-foreground">{error}</p>}

          {!loading &&
            videos?.map((v, i) => (
              <div key={v.id} className="rounded-lg border border-border bg-card p-2">
                <button
                  type="button"
                  onClick={() => {
                    setPlayingIndex(i);
                    onPlay?.();
                  }}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span className="relative shrink-0">
                    <img
                      src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`}
                      alt={`${v.title} thumbnail`}
                      loading="lazy"
                      className="h-14 w-24 rounded-md object-cover"
                    />
                    <Play className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-primary-foreground drop-shadow" />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-sm font-medium">{v.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {v.channel}
                      {v.duration ? ` · ${v.duration}` : ""}
                    </span>
                  </span>
                </button>
              </div>
            ))}

          {!loading && (
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block pt-1 text-xs font-semibold text-primary hover:underline"
            >
              More videos on YouTube →
            </a>
          )}
        </div>
      )}

      {playingIndex !== null && videos && videos.length > 0 && (
        <VideoPlayerOverlay
          videos={videos}
          index={playingIndex}
          chapterLabel={chapterLabel ?? label}
          onIndexChange={setPlayingIndex}
          onClose={() => setPlayingIndex(null)}
        />
      )}
    </div>
  );
}
