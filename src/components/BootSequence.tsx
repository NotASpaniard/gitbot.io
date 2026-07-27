"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/profile";
import { usePrefersReducedMotion } from "@/lib/browser-hooks";

const { identity } = profile;

const LINES: [string, string][] = [
  ["0.000", `${identity.host} kernel 6.2.0 đang khởi động`],
  ["0.142", `mount /home/${identity.handle}`],
  ["0.318", "start coffee.service"],
  ["0.501", "load profile.ts"],
  ["0.744", "resolve personality matrix"],
  ["0.912", "init shell"],
];

const STEP_MS = 130;

/** Màn khởi động giả lập, bấm phím hoặc bấm chuột để bỏ qua. */
export function BootSequence({ onDone }: { onDone: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(0);
  const shown = reducedMotion ? LINES.length : revealed;

  useEffect(() => {
    if (reducedMotion) {
      onDone();
      return;
    }

    let index = 0;
    let finishTimer = 0;

    const timer = window.setInterval(() => {
      index += 1;
      setRevealed(index);
      if (index >= LINES.length) {
        window.clearInterval(timer);
        finishTimer = window.setTimeout(onDone, 260);
      }
    }, STEP_MS);

    const skip = () => {
      window.clearInterval(timer);
      window.clearTimeout(finishTimer);
      setRevealed(LINES.length);
      onDone();
    };

    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(finishTimer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone, reducedMotion]);

  return (
    <div className="space-y-0.5 py-1 text-xs sm:text-sm">
      {LINES.slice(0, shown).map(([time, label]) => (
        <p key={time} className="reveal">
          <span className="text-term-dim">[ {time} ]</span>{" "}
          <span className="text-term-fg">{label}</span>{" "}
          <span className="text-term-accent">ok</span>
        </p>
      ))}
      {shown < LINES.length && (
        <p className="text-term-dim">Bấm phím bất kỳ để bỏ qua…</p>
      )}
    </div>
  );
}
