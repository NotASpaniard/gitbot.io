import { Banner } from "@/components/output/Banner";
import { ExperienceTimeline } from "@/components/output/ExperienceTimeline";
import { GameAccounts } from "@/components/output/GameAccounts";
import { HobbyList } from "@/components/output/HobbyList";
import { Neofetch } from "@/components/output/Neofetch";
import {
  Dim,
  OutputBlock,
  SectionTitle,
  Tag,
  TermLink,
} from "@/components/output/primitives";
import { ProjectList } from "@/components/output/ProjectList";
import { SkillBars } from "@/components/output/SkillBars";
import { SocialGrid } from "@/components/output/SocialGrid";
import { Typewriter } from "@/components/Typewriter";
import { profile } from "@/data/profile";
import type { Command } from "./terminal-types";
import { isThemeName, THEME_NAMES, themes } from "./themes";

const { identity, about, contact } = profile;

/** Bảng `help` sinh trực tiếp từ danh sách lệnh nên không bao giờ lệch. */
function HelpTable() {
  const visible = commands.filter((command) => !command.hidden);

  return (
    <OutputBlock>
      <SectionTitle>lệnh khả dụng</SectionTitle>
      <ul className="space-y-1">
        {visible.map((command) => (
          <li key={command.name} className="flex flex-wrap gap-x-3">
            <code className="w-44 shrink-0 text-term-accent">
              {command.usage ?? command.name}
            </code>
            <span className="text-term-fg">{command.description}</span>
          </li>
        ))}
      </ul>
      <Dim>
        Mẹo: Tab để tự hoàn thành · ↑/↓ để xem lại lệnh cũ · Ctrl+L để xoá màn
        hình. Vẫn còn vài lệnh không nằm trong bảng này.
      </Dim>
    </OutputBlock>
  );
}

function ErrorLine({ children }: { children: React.ReactNode }) {
  return (
    <OutputBlock>
      <p className="text-term-error">{children}</p>
    </OutputBlock>
  );
}

export const commands: Command[] = [
  {
    name: "help",
    aliases: ["?", "man"],
    description: "Hiện danh sách lệnh này",
    run: () => <HelpTable />,
  },
  {
    name: "whoami",
    description: "Tóm tắt một dòng về chủ trang",
    run: () => (
      <OutputBlock>
        <p>
          <span className="text-glow text-term-accent">{identity.name}</span>
          <Dim> — </Dim>
          {identity.role}
          <Dim> · </Dim>
          {identity.location}
        </p>
        <Dim>{identity.tagline}</Dim>
      </OutputBlock>
    ),
  },
  {
    name: "about",
    aliases: ["bio"],
    description: "Giới thiệu dài hơn về mình",
    run: () => (
      <OutputBlock>
        <SectionTitle>about</SectionTitle>
        <Typewriter
          text={about.join("\n\n")}
          className="max-w-prose text-term-fg"
        />
      </OutputBlock>
    ),
  },
  {
    name: "neofetch",
    description: "Thẻ thông tin nhanh kiểu Linux",
    run: (_args, api) => <Neofetch projectCount={api.projects.length} />,
  },
  {
    name: "projects",
    aliases: ["work"],
    usage: "projects [từ khoá]",
    description: "Dự án đã làm, lọc được theo tên hoặc công nghệ",
    run: (args, api) => {
      const query = args.join(" ").trim().toLowerCase();
      if (!query) return <ProjectList items={api.projects} />;

      const matched = api.projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.tech.some((tech) => tech.toLowerCase().includes(query)),
      );

      return matched.length ? (
        <ProjectList items={matched} />
      ) : (
        <ErrorLine>
          Không có dự án nào khớp với &lsquo;{query}&rsquo;.
        </ErrorLine>
      );
    },
  },
  {
    name: "skills",
    aliases: ["stack"],
    description: "Kỹ năng theo nhóm, kèm mức độ thành thạo",
    run: () => <SkillBars />,
  },
  {
    name: "experience",
    aliases: ["exp", "cv"],
    description: "Kinh nghiệm làm việc và học vấn",
    run: () => <ExperienceTimeline />,
  },
  {
    name: "social",
    aliases: ["links"],
    description: "Các kênh mạng xã hội",
    run: () => <SocialGrid />,
  },
  {
    name: "games",
    aliases: ["gaming"],
    description: "Tài khoản game — rủ chơi thì cứ ping",
    run: () => <GameAccounts />,
  },
  {
    name: "hobbies",
    aliases: ["interests"],
    description: "Sở thích ngoài giờ code",
    run: () => <HobbyList />,
  },
  {
    name: "contact",
    aliases: ["mail", "hire"],
    description: "Gửi tin nhắn trực tiếp từ terminal",
    run: (_args, api) => {
      api.startContact();
    },
  },
  {
    name: "email",
    description: "Mở ứng dụng mail với địa chỉ của mình",
    run: () => (
      <OutputBlock>
        <p>
          <Dim>→ </Dim>
          <TermLink href={`mailto:${contact.email}`}>{contact.email}</TermLink>
        </p>
        <Dim>{contact.note}</Dim>
      </OutputBlock>
    ),
  },
  {
    name: "theme",
    usage: "theme [tên]",
    description: `Đổi bảng màu (${THEME_NAMES.join(", ")})`,
    run: (args, api) => {
      const requested = args[0]?.toLowerCase();

      if (!requested) {
        return (
          <OutputBlock>
            <SectionTitle>themes</SectionTitle>
            <ul className="space-y-1">
              {THEME_NAMES.map((name) => (
                <li key={name} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-3 w-3 rounded-xs border border-term-border"
                    style={{ backgroundColor: themes[name].swatch }}
                  />
                  <code className="w-24 text-term-accent">{name}</code>
                  <span className="text-term-fg">{themes[name].label}</span>
                  {name === api.theme && <Tag tone="accent">đang dùng</Tag>}
                </li>
              ))}
            </ul>
            <Dim>Dùng: theme dracula</Dim>
          </OutputBlock>
        );
      }

      if (!isThemeName(requested)) {
        return (
          <ErrorLine>
            Không có theme &lsquo;{requested}&rsquo;. Gõ &lsquo;theme&rsquo; để
            xem danh sách.
          </ErrorLine>
        );
      }

      api.setTheme(requested);
      return (
        <OutputBlock>
          <p className="text-term-accent">Đã đổi sang theme {requested}.</p>
        </OutputBlock>
      );
    },
  },
  {
    name: "banner",
    description: "Vẽ lại banner chào mừng",
    run: () => <Banner />,
  },
  {
    name: "history",
    description: "Các lệnh đã gõ trong phiên này",
    run: (_args, api) => {
      if (!api.commandHistory.length) {
        return (
          <OutputBlock>
            <Dim>Chưa có lệnh nào.</Dim>
          </OutputBlock>
        );
      }
      return (
        <OutputBlock>
          <ol className="space-y-0.5">
            {api.commandHistory.map((entry, index) => (
              <li key={`${index}-${entry}`}>
                <Dim>{String(index + 1).padStart(3, " ")} </Dim>
                <span className="text-term-fg">{entry}</span>
              </li>
            ))}
          </ol>
        </OutputBlock>
      );
    },
  },
  {
    name: "ls",
    description: "Liệt kê các mục có thể xem",
    run: () => (
      <OutputBlock>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {[
            "about",
            "projects",
            "skills",
            "experience",
            "social",
            "games",
            "hobbies",
            "contact",
          ].map((item) => (
            <span key={item} className="text-term-accent">
              {item}/
            </span>
          ))}
        </div>
        <Dim>Gõ tên mục để mở, ví dụ: projects</Dim>
      </OutputBlock>
    ),
  },
  {
    name: "clear",
    aliases: ["cls"],
    description: "Xoá sạch màn hình",
    run: (_args, api) => {
      api.clear();
    },
  },
  {
    name: "date",
    description: "Giờ hiện tại của bạn và của mình",
    run: () => {
      const now = new Date();
      return (
        <OutputBlock>
          <p>
            <span className="text-term-accent2">Máy bạn </span>
            {now.toLocaleString("vi-VN")}
          </p>
          <p>
            <span className="text-term-accent2">Chỗ mình </span>
            {now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}{" "}
            <Dim>({identity.timezone})</Dim>
          </p>
        </OutputBlock>
      );
    },
  },
  {
    name: "echo",
    usage: "echo <nội dung>",
    description: "In lại đúng những gì bạn gõ",
    run: (args) => (
      <OutputBlock>
        <p className="whitespace-pre-wrap">{args.join(" ")}</p>
      </OutputBlock>
    ),
  },

  // ── Easter egg: không hiện trong `help` ─────────────────────────────────
  {
    name: "sudo",
    hidden: true,
    description: "Thử quyền root",
    run: (args) => (
      <OutputBlock>
        <p className="text-term-error">
          {identity.handle} không nằm trong danh sách sudoers. Vụ này sẽ được
          báo cáo.
        </p>
        {args.length > 0 && <Dim>(lệnh bị chặn: {args.join(" ")})</Dim>}
      </OutputBlock>
    ),
  },
  {
    name: "rm",
    hidden: true,
    description: "Xoá file",
    run: (args, api) => {
      if (args.join(" ").includes("-rf")) {
        api.runEffect("crash");
        return (
          <OutputBlock>
            <p className="text-term-error">
              rm: đang xoá /… đùa thôi, trang này chỉ đọc.
            </p>
            <Dim>Nhưng cũng hết hồn đúng không.</Dim>
          </OutputBlock>
        );
      }
      return <ErrorLine>rm: cần quyền ghi, mà bạn thì không có.</ErrorLine>;
    },
  },
  {
    name: "matrix",
    hidden: true,
    description: "Mưa ký tự",
    run: (_args, api) => {
      api.runEffect("matrix");
    },
  },
  {
    name: "exit",
    aliases: ["quit", "logout"],
    hidden: true,
    description: "Thoát",
    run: () => (
      <OutputBlock>
        <p className="text-term-fg">
          Không thoát được đâu. Đóng tab thì được, nhưng ở lại chơi tiếp đi.
        </p>
      </OutputBlock>
    ),
  },
  {
    name: "pwd",
    hidden: true,
    description: "Thư mục hiện tại",
    run: () => (
      <OutputBlock>
        <p className="text-term-fg">/home/{identity.handle}</p>
      </OutputBlock>
    ),
  },
  {
    name: "coffee",
    hidden: true,
    description: "Pha cà phê",
    run: () => (
      <OutputBlock>
        <pre className="text-term-accent">{`   ( (
    ) )
  ........
  |      |]
  \\      /
   '----'`}</pre>
        <Dim>HTTP 418 — I&apos;m a teapot.</Dim>
      </OutputBlock>
    ),
  },
];

const lookup = new Map<string, Command>();
for (const command of commands) {
  lookup.set(command.name, command);
  for (const alias of command.aliases ?? []) lookup.set(alias, command);
}

export function findCommand(name: string): Command | undefined {
  return lookup.get(name.toLowerCase());
}

/** Mọi tên gõ được, kể cả alias và lệnh ẩn — dùng cho autocomplete. */
export const allCommandNames: string[] = [...lookup.keys()].sort();

/** Chỉ tên lệnh công khai — dùng khi gợi ý lệnh gõ sai. */
export const publicCommandNames: string[] = commands
  .filter((command) => !command.hidden)
  .map((command) => command.name)
  .sort();
