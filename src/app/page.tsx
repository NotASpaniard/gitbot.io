import { AppShell } from "@/components/AppShell";
import { profile } from "@/data/profile";
import { getProjects } from "@/lib/github";

const { identity, about } = profile;

export default async function Home() {
  // Chạy phía máy chủ nên token GitHub không bao giờ lộ ra trình duyệt,
  // và kết quả được cache 1 tiếng (xem REVALIDATE_SECONDS trong lib/github.ts).
  const { projects, source } = await getProjects();

  return (
    <>
      {/*
        Terminal là giao diện chính nhưng nội dung của nó do JS sinh ra và
        trang không có tiêu đề nào ở DOM ban đầu. Khối dưới đây cho trình đọc
        màn hình và công cụ tìm kiếm một bản tóm tắt tĩnh, có ngay khi tải xong.
      */}
      <div className="sr-only">
        <h1>
          {identity.name} — {identity.role}
        </h1>
        <p>{identity.tagline}</p>
        <p>{about[0]}</p>
        <h2>Dự án</h2>
        <ul>
          {projects.map((project) => (
            <li key={project.name}>
              {project.name}: {project.description}
            </li>
          ))}
        </ul>
        <p>
          Trang này là một terminal tương tác. Gõ &ldquo;help&rdquo; để xem danh
          sách lệnh, hoặc bấm các nút gợi ý ở cuối màn hình.
        </p>
      </div>

      <AppShell projects={projects} projectSource={source} />
    </>
  );
}
