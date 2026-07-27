import { profile, type Project } from "@/data/profile";
import { Dim, OutputBlock, SectionTitle, Tag, TermLink } from "./primitives";

const statusLabel: Record<NonNullable<Project["status"]>, string> = {
  active: "đang phát triển",
  archived: "đã lưu trữ",
  wip: "đang làm dở",
};

export function ProjectList({ items = profile.projects }: { items?: Project[] }) {
  // Chỉ xảy ra khi cả GitHub lẫn danh sách dự phòng đều không có gì.
  // Kết quả lọc không khớp được xử lý riêng ở lệnh `projects`.
  if (!items.length) {
    return (
      <OutputBlock>
        <SectionTitle>projects</SectionTitle>
        <p className="text-term-fg">
          Chưa lấy được danh sách dự án từ GitHub.
        </p>
        <p>
          <Dim>→ </Dim>
          <TermLink href={`https://github.com/${profile.github.login}`}>
            Xem trực tiếp tại github.com/{profile.github.login}
          </TermLink>
        </p>
      </OutputBlock>
    );
  }

  return (
    <OutputBlock>
      <SectionTitle>projects ({items.length})</SectionTitle>

      <ul className="space-y-3">
        {items.map((project, index) => (
          <li
            key={project.name}
            className="border-l-2 border-term-border pl-3 transition-colors hover:border-term-accent"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <Dim>[{String(index + 1).padStart(2, "0")}]</Dim>
              <span className="text-glow font-semibold text-term-accent">
                {project.name}
              </span>
              {project.featured && <Tag tone="accent">nổi bật</Tag>}
              {project.status && (
                <Dim>· {statusLabel[project.status]}</Dim>
              )}
              <span className="ml-auto flex items-center gap-3 text-term-dim">
                {typeof project.stars === "number" && (
                  <span title="Sao trên GitHub">★ {project.stars}</span>
                )}
                <span>{project.year}</span>
              </span>
            </div>

            <p className="mt-1 text-term-fg">{project.description}</p>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {project.tech.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>

            {(project.repo || project.demo) && (
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {project.repo && (
                  <span>
                    <Dim>→ </Dim>
                    <TermLink href={project.repo}>mã nguồn</TermLink>
                  </span>
                )}
                {project.demo && (
                  <span>
                    <Dim>→ </Dim>
                    <TermLink href={project.demo}>bản chạy thật</TermLink>
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </OutputBlock>
  );
}
