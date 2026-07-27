import { profile } from "@/data/profile";
import { Icon } from "@/lib/icons";
import { Dim, OutputBlock, SectionTitle, TermLink } from "./primitives";

export function SocialGrid() {
  return (
    <OutputBlock>
      <SectionTitle>social</SectionTitle>
      <ul className="grid gap-2 sm:grid-cols-2">
        {profile.socials.map((social) => (
          <li
            key={social.label}
            className="flex items-center gap-3 rounded-sm border border-term-border bg-term-panel/60 px-3 py-2 transition-colors hover:border-term-accent"
          >
            <span className="text-term-accent">
              <Icon name={social.icon} className="h-4 w-4" />
            </span>
            <span className="w-20 shrink-0 text-term-fg">{social.label}</span>
            <TermLink href={social.url}>{social.username}</TermLink>
          </li>
        ))}
      </ul>
      <Dim>Mở link bằng cách bấm trực tiếp vào tên tài khoản.</Dim>
    </OutputBlock>
  );
}
