import { profile } from "@/data/profile";
import { OutputBlock, SectionTitle } from "./primitives";

const BAR_WIDTH = 20;

function bar(level: number) {
  const filled = Math.round((Math.min(100, Math.max(0, level)) / 100) * BAR_WIDTH);
  return "█".repeat(filled) + "░".repeat(BAR_WIDTH - filled);
}

export function SkillBars() {
  return (
    <OutputBlock>
      {profile.skills.map((group) => (
        <div key={group.category}>
          <SectionTitle>{group.category}</SectionTitle>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.name} className="flex flex-wrap items-center gap-x-3">
                <span className="w-36 shrink-0 text-term-fg">{item.name}</span>
                <span
                  className="text-glow tracking-tighter text-term-accent"
                  role="meter"
                  aria-valuenow={item.level}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={item.name}
                >
                  {bar(item.level)}
                </span>
                <span className="text-term-dim tabular-nums">{item.level}%</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </OutputBlock>
  );
}
