"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/browser-hooks";

const CHARS_PER_TICK = 2;

/**
 * Gõ dần một khối văn bản. Bấm phím bất kỳ để hiện ngay toàn bộ,
 * và bỏ qua hoàn toàn nếu người dùng bật "giảm chuyển động".
 */
export function Typewriter({
  text,
  speed = 14,
  className = "",
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [typed, setTyped] = useState(0);
  const shown = reducedMotion ? text.length : typed;

  useEffect(() => {
    if (reducedMotion) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index += CHARS_PER_TICK;
      if (index >= text.length) {
        setTyped(text.length);
        window.clearInterval(timer);
      } else {
        setTyped(index);
      }
    }, speed);

    const skip = () => {
      setTyped(text.length);
      window.clearInterval(timer);
    };

    window.addEventListener("keydown", skip);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("keydown", skip);
    };
  }, [reducedMotion, text, speed]);

  const done = shown >= text.length;

  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {text.slice(0, shown)}
      {!done && (
        <span className="cursor-blink text-term-accent" aria-hidden>
          ▊
        </span>
      )}
    </p>
  );
}
