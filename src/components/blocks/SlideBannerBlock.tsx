import { useState, useEffect, useCallback, useRef } from "react";
import type { SlideBannerBlock, SlideBannerProps } from "../../types/blocks";

interface Props {
  block: SlideBannerBlock;
  onChange: (p: Partial<SlideBannerProps>) => void;
  isEditing: boolean;
}

export default function SlideBannerBlock({ block, isEditing }: Props) {
  const { slides, height, autoplay, autoplayInterval, showArrows, showIndicators, objectFit, borderRadius } = block.props;
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = slides.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!autoplay || isEditing || total < 2) return;
    timerRef.current = setInterval(next, autoplayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay, autoplayInterval, next, isEditing, total]);

  // Reset index if slides change
  useEffect(() => {
    if (current >= total && total > 0) setCurrent(0);
  }, [total, current]);

  if (total === 0) {
    return (
      <div
        style={{ height: `${height}px`, borderRadius: borderRadius ? `${borderRadius}px` : undefined, backgroundColor: "#e2e8f0" }}
        className="flex items-center justify-center text-[#94a3b8] text-sm"
      >
        No slides yet — add slides in the Properties panel
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ height: `${height}px`, borderRadius: borderRadius ? `${borderRadius}px` : undefined }}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === Math.min(current, total - 1) ? 1 : 0, pointerEvents: i === Math.min(current, total - 1) ? "auto" : "none" }}
        >
          {s.imageSrc ? (
            <img
              src={s.imageSrc}
              alt={s.imageAlt}
              style={{ width: "100%", height: "100%", objectFit }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2563eb] to-[#64748b]" />
          )}
          {/* Overlay */}
          {s.overlayColor && (
            <div className="absolute inset-0" style={{ backgroundColor: s.overlayColor }} />
          )}
          {/* Text content */}
          {(s.title || s.subtitle || s.ctaLabel) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
              {s.title && (
                <h2 style={{ color: s.titleColor ?? "#ffffff", margin: 0, fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 }}>
                  {s.title}
                </h2>
              )}
              {s.subtitle && (
                <p style={{ color: s.subtitleColor ?? "#f1f5f9", margin: 0, fontSize: "1.125rem" }}>
                  {s.subtitle}
                </p>
              )}
              {s.ctaLabel && (
                isEditing ? (
                  <span className="inline-block px-6 py-2.5 bg-white text-[#1e293b] rounded-lg font-semibold text-sm">
                    {s.ctaLabel}
                  </span>
                ) : (
                  <a
                    href={s.ctaHref ?? "#"}
                    className="inline-block px-6 py-2.5 bg-white text-[#1e293b] rounded-lg font-semibold text-sm hover:bg-[#f1f5f9] transition-colors"
                  >
                    {s.ctaLabel}
                  </a>
                )
              )}
            </div>
          )}
        </div>
      ))}

      {/* Arrows */}
      {showArrows && total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && total > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`rounded-full transition-all ${i === Math.min(current, total - 1) ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/75"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide counter (editor only) */}
      {isEditing && total > 1 && (
        <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded z-10">
          {Math.min(current, total - 1) + 1} / {total}
        </div>
      )}
    </div>
  );
}
