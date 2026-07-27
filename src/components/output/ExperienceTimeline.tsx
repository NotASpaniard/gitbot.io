import { profile } from "@/data/profile";
import { Dim, OutputBlock, SectionTitle } from "./primitives";

export function ExperienceTimeline() {
  return (
    <OutputBlock>
      <SectionTitle>experience</SectionTitle>
      <ol className="space-y-3">
        {profile.experience.map((entry) => (
          <li
            key={`${entry.period}-${entry.title}`}
            className="relative border-l-2 border-term-border pl-4"
          >
            <span
              aria-hidden
              className="absolute top-2 -left-[5px] h-2 w-2 rounded-full bg-term-accent"
            />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-term-accent2 tabular-nums">
                {entry.period}
              </span>
              <span className="text-glow font-semibold text-term-accent">
                {entry.title}
              </span>
              <Dim>@ {entry.org}</Dim>
            </div>
            <p className="mt-0.5 text-term-fg">{entry.detail}</p>
          </li>
        ))}
      </ol>
    </OutputBlock>
  );
}
