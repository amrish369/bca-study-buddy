import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Maximize2,
  Minimize2,
  Unlock,
  X,
} from "lucide-react";

export type OverlayVideo = { id: string; title: string; channel: string };

/**
 * Immersive full-screen YouTube player.
 * - fills the screen in both portrait and landscape
 * - swipe left/right (or arrow keys) to move to the next/previous video of the chapter
 * - screen-lock button blocks accidental taps and swipes
 */
export function VideoPlayerOverlay({
  videos,
  index,
  onIndexChange,
  onClose,
  chapterLabel,
}: {
  videos: OverlayVideo[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
  chapterLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [locked, setLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const video = videos[index];

  const showHint = useCallback((text: string) => {
    setHint(text);
    window.setTimeout(() => setHint(null), 1400);
  }, []);

  const go = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next < 0) {
        showHint("This is the first video");
        return;
      }
      if (next >= videos.length) {
        showHint("This is the last video");
        return;
      }
      onIndexChange(next);
      showHint(delta > 0 ? "Next video" : "Previous video");
    },
    [index, onIndexChange, showHint, videos.length],
  );

  // lock body scroll while the player is open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (locked) return;
        onClose();
      }
      if (locked) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, locked, onClose]);

  async function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
        const orientation = (
          screen as Screen & { orientation?: { lock?: (o: string) => Promise<void> } }
        ).orientation;
        await orientation?.lock?.("landscape").catch(() => undefined);
      }
    } catch {
      showHint("Fullscreen not allowed by the browser");
    }
  }

  if (!video) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[120] flex flex-col bg-black"
      onTouchStart={(e) => {
        if (locked) return;
        const t = e.touches[0];
        touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
      }}
      onTouchEnd={(e) => {
        if (locked || !touchStart.current) return;
        const t = e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - touchStart.current.x;
        const dy = t.clientY - touchStart.current.y;
        touchStart.current = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      }}
    >
      {/* top bar */}
      <div className="flex items-start gap-2 bg-black/90 px-3 py-2 text-white landscape:py-1">
        <div className="min-w-0 flex-1">
          {chapterLabel && (
            <p className="truncate text-[11px] uppercase tracking-wide text-white/50">
              {chapterLabel}
            </p>
          )}
          <p className="truncate text-sm font-semibold">{video.title}</p>
          <p className="truncate text-xs text-white/60">
            {video.channel} · {index + 1}/{videos.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLocked((v) => !v);
            showHint(locked ? "Screen unlocked" : "Screen locked");
          }}
          aria-label={locked ? "Unlock screen" : "Lock screen"}
          className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
        >
          {locked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          disabled={locked}
          aria-label="Toggle fullscreen"
          className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-40"
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={locked}
          aria-label="Close player"
          className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-40"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* player */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <iframe
          key={video.id}
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full max-h-full w-full border-0 landscape:aspect-auto"
        />

        {locked && (
          <button
            type="button"
            onClick={() => {
              setLocked(false);
              showHint("Screen unlocked");
            }}
            aria-label="Unlock screen"
            className="absolute inset-0 flex items-end justify-center bg-transparent pb-8"
          >
            <span className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-semibold text-white">
              <Lock className="h-4 w-4" /> Screen locked — tap to unlock
            </span>
          </button>
        )}

        {!locked && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous video"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next video"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {hint && (
          <span className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
            {hint}
          </span>
        )}
      </div>

      {!locked && (
        <p className="bg-black/90 px-3 py-2 text-center text-[11px] text-white/50 landscape:hidden">
          Swipe left / right for the next or previous video of this chapter
        </p>
      )}
    </div>
  );
}
