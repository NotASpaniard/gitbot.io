import { profile } from "@/data/profile";
import { Icon } from "@/lib/icons";
import { Dim, OutputBlock, SectionTitle, Tag, TermLink } from "./primitives";

export function GameAccounts() {
  return (
    <OutputBlock>
      <SectionTitle>game accounts</SectionTitle>
      <ul className="grid gap-2 sm:grid-cols-2">
        {profile.games.map((game) => (
          <li
            key={game.platform}
            className="flex items-center gap-3 rounded-sm border border-term-border bg-term-panel/60 px-3 py-2 transition-colors hover:border-term-accent"
          >
            <span className="text-term-accent">
              <Icon name={game.icon} className="h-4 w-4" />
            </span>

            <div className="min-w-0 grow">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-term-fg">{game.platform}</span>
                {game.rank && <Tag tone="accent">{game.rank}</Tag>}
                {game.hours && <Dim>{game.hours}</Dim>}
              </div>
              <div className="truncate text-term-accent2">
                {game.url ? (
                  <TermLink href={game.url}>{game.username}</TermLink>
                ) : (
                  game.username
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Dim>Rủ chơi thì cứ add, mình nhận hết.</Dim>
    </OutputBlock>
  );
}
