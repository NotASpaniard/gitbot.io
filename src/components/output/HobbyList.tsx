import { profile } from "@/data/profile";
import { Icon } from "@/lib/icons";
import { Dim, OutputBlock, SectionTitle } from "./primitives";

export function HobbyList() {
  return (
    <OutputBlock>
      <SectionTitle>hobbies</SectionTitle>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {profile.hobbies.map((hobby) => (
          <li
            key={hobby.label}
            className="flex items-start gap-3 rounded-sm border border-term-border bg-term-panel/60 px-3 py-2 transition-colors hover:border-term-accent"
          >
            <span className="mt-0.5 text-term-accent">
              <Icon name={hobby.icon} className="h-4 w-4" />
            </span>
            <div>
              <div className="text-term-fg">{hobby.label}</div>
              {hobby.note && <Dim>{hobby.note}</Dim>}
            </div>
          </li>
        ))}
      </ul>
    </OutputBlock>
  );
}
