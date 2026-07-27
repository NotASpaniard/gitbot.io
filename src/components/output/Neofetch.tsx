import { profile } from "@/data/profile";
import { OutputBlock } from "./primitives";

const { identity, skills, projects, socials } = profile;

function topSkills() {
  return skills
    .flatMap((group) => group.items)
    .sort((a, b) => b.level - a.level)
    .slice(0, 4)
    .map((item) => item.name)
    .join(", ");
}

export function Neofetch({
  projectCount = projects.length,
}: {
  projectCount?: number;
}) {
  const rows: [string, string][] = [
    ["OS", "Human 1.0 (Vietnamese build)"],
    ["Host", identity.host],
    ["Role", identity.role],
    ["Uptime", identity.uptime],
    ["Shell", "bash — thỉnh thoảng zsh"],
    ["Editor", "VS Code + Vim keybindings"],
    ["Location", `${identity.location} (${identity.timezone})`],
    ["Languages", topSkills()],
    ["Projects", `${projectCount} công khai`],
    ["Contacts", `${socials.length} kênh — gõ 'social'`],
  ];

  return (
    <OutputBlock>
      <div className="term-scroll -mx-1 overflow-x-auto px-1">
        <div className="flex w-max items-start gap-6">
          <pre
            className="text-glow shrink-0 text-[0.6rem] leading-tight text-term-accent sm:text-xs"
            aria-hidden
          >
            {identity.neofetchLogo}
          </pre>

          <dl className="space-y-0.5 text-xs sm:text-sm">
            <div className="mb-1">
              <span className="text-glow font-semibold text-term-accent">
                {identity.handle}
              </span>
              <span className="text-term-dim">@</span>
              <span className="text-glow font-semibold text-term-accent">
                {identity.host}
              </span>
            </div>
            <div className="mb-1 h-px bg-term-border" />
            {rows.map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-20 shrink-0 text-term-accent2">{label}</dt>
                <dd className="text-term-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Dải màu như neofetch thật, đổi theo theme đang chọn */}
      <div className="flex gap-1" aria-hidden>
        {[
          "bg-term-bg",
          "bg-term-panel",
          "bg-term-border",
          "bg-term-dim",
          "bg-term-fg",
          "bg-term-accent2",
          "bg-term-accent",
          "bg-term-error",
        ].map((tone) => (
          <span
            key={tone}
            className={`h-3 w-5 rounded-xs border border-term-border ${tone}`}
          />
        ))}
      </div>
    </OutputBlock>
  );
}
