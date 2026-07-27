"use client";

import { useEffect, useMemo } from "react";
import { useViewportWidth } from "@/lib/browser-hooks";

const GLYPHS = "アイウエオカキクケコサシスセソ0123456789ﾊﾋﾌﾍﾎ$#%&@";

/** Sinh chuỗi ký tự giả ngẫu nhiên nhưng tất định theo seed, tránh lệch SSR. */
function column(seed: number, length: number) {
  let value = seed * 9301 + 49297;
  let out = "";
  for (let i = 0; i < length; i += 1) {
    value = (value * 9301 + 49297) % 233280;
    out += GLYPHS[Math.floor((value / 233280) * GLYPHS.length)];
  }
  return out;
}

/** Mưa ký tự kiểu Matrix, tự tắt sau `duration` ms. */
export function MatrixRain({
  duration = 4500,
  onDone,
}: {
  duration?: number;
  onDone: () => void;
}) {
  const width = useViewportWidth();
  const columns = Math.min(60, Math.ceil(width / 18));

  useEffect(() => {
    const timer = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onDone]);

  const strips = useMemo(
    () =>
      Array.from({ length: columns }, (_, i) => ({
        text: column(i + 7, 34),
        delay: ((i * 37) % 100) / 40,
        speed: 2.2 + ((i * 13) % 30) / 10,
      })),
    [columns],
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden bg-term-bg/70"
      aria-hidden
    >
      {strips.map((strip, i) => (
        <pre
          key={i}
          className="rain-column absolute top-0 text-[0.7rem] leading-tight text-term-accent/70"
          style={{
            left: `${(i / columns) * 100}%`,
            animationDelay: `${strip.delay}s`,
            animationDuration: `${strip.speed}s`,
          }}
        >
          {strip.text.split("").join("\n")}
        </pre>
      ))}
      <p className="absolute bottom-6 w-full text-center text-term-accent2">
        Bấm phím bất kỳ để thoát...
      </p>
    </div>
  );
}
