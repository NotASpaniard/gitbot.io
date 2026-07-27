import { profile, type Project } from "@/data/profile";

/** Giữ dữ liệu 1 tiếng rồi mới gọi lại GitHub — tránh chạm trần rate limit. */
const REVALIDATE_SECONDS = 3600;

export type ProjectSource = "pinned" | "top-starred" | "manual";

export type ProjectsResult = {
  source: ProjectSource;
  projects: Project[];
  /** Vì sao phải lùi về nguồn kém ưu tiên hơn — chỉ để log, không hiện ra UI. */
  note?: string;
};

// ── Kiểu dữ liệu trả về từ GitHub ────────────────────────────────────────

type GraphQLRepo = {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  isArchived: boolean;
  pushedAt: string | null;
  primaryLanguage: { name: string } | null;
  repositoryTopics: { nodes: { topic: { name: string } }[] };
};

type RestRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  archived: boolean;
  fork: boolean;
  pushed_at: string | null;
  language: string | null;
  topics?: string[];
};

// ── Chuyển đổi sang kiểu Project của trang ───────────────────────────────

function yearOf(timestamp: string | null): string {
  if (!timestamp) return "";
  return String(new Date(timestamp).getFullYear());
}

/** Ngôn ngữ chính đứng trước, sau đó tới topic, tối đa 4 thẻ cho gọn. */
function techList(language: string | null, topics: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of [language, ...topics]) {
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length === 4) break;
  }

  return result;
}

function fromGraphQL(repo: GraphQLRepo, index: number): Project {
  return {
    name: repo.name,
    description: repo.description ?? "Chưa có mô tả.",
    tech: techList(
      repo.primaryLanguage?.name ?? null,
      repo.repositoryTopics.nodes.map((node) => node.topic.name),
    ),
    repo: repo.url,
    demo: repo.homepageUrl || undefined,
    stars: repo.stargazerCount,
    year: yearOf(repo.pushedAt),
    // Repo đã ghim vốn là những cái chủ nhân muốn khoe — hai cái đầu cho nổi bật.
    featured: index < 2,
    status: repo.isArchived ? "archived" : "active",
  };
}

function fromRest(repo: RestRepo, index: number): Project {
  return {
    name: repo.name,
    description: repo.description ?? "Chưa có mô tả.",
    tech: techList(repo.language, repo.topics ?? []),
    repo: repo.html_url,
    demo: repo.homepage || undefined,
    stars: repo.stargazers_count,
    year: yearOf(repo.pushed_at),
    featured: index < 2,
    status: repo.archived ? "archived" : "active",
  };
}

// ── Cách 1: repo đã ghim, cần token ──────────────────────────────────────

const PINNED_QUERY = `
  query PinnedRepos($login: String!, $limit: Int!) {
    user(login: $login) {
      pinnedItems(first: $limit, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            stargazerCount
            isArchived
            pushedAt
            primaryLanguage { name }
            repositoryTopics(first: 8) { nodes { topic { name } } }
          }
        }
      }
    }
  }
`;

async function fetchPinned(
  login: string,
  limit: number,
  token: string,
): Promise<Project[]> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: PINNED_QUERY,
      variables: { login, limit },
    }),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`GraphQL trả về ${response.status}`);
  }

  const payload = await response.json();

  // GraphQL vẫn trả 200 khi có lỗi nghiệp vụ, nên phải kiểm tra riêng.
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "GraphQL báo lỗi");
  }

  const nodes: GraphQLRepo[] = payload.data?.user?.pinnedItems?.nodes ?? [];
  return nodes.filter(Boolean).map(fromGraphQL);
}

// ── Cách 2: repo nhiều sao nhất, không cần token ─────────────────────────

async function fetchTopStarred(
  login: string,
  limit: number,
): Promise<Project[]> {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(
      login,
    )}/repos?per_page=100&sort=updated`,
    {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new Error(`REST trả về ${response.status}`);
  }

  const repos: RestRepo[] = await response.json();

  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit)
    .map(fromRest);
}

// ── Điểm vào ─────────────────────────────────────────────────────────────

/**
 * Lấy danh sách dự án theo thứ tự ưu tiên: repo đã ghim → repo nhiều sao →
 * danh sách khai báo tay trong profile.ts. Không bao giờ ném lỗi ra ngoài,
 * vì trang vẫn phải hiển thị được kể cả khi GitHub sập.
 */
export async function getProjects(): Promise<ProjectsResult> {
  const { login, limit } = profile.github;
  const token = process.env.GITHUB_TOKEN;

  const fallback = (note: string): ProjectsResult => ({
    source: "manual",
    projects: profile.projects,
    note,
  });

  if (!login || login === "username") {
    return fallback("Chưa điền github.login trong profile.ts");
  }

  if (token) {
    try {
      const projects = await fetchPinned(login, limit, token);
      if (projects.length) return { source: "pinned", projects };
      // Tài khoản không ghim repo nào — rơi xuống cách 2 thay vì trả mảng rỗng.
    } catch (error) {
      console.warn("Không lấy được repo đã ghim:", error);
    }
  }

  try {
    const projects = await fetchTopStarred(login, limit);
    if (projects.length) return { source: "top-starred", projects };
    return fallback("Tài khoản GitHub chưa có repo công khai nào");
  } catch (error) {
    console.warn("Không lấy được repo từ GitHub:", error);
    return fallback("Gọi GitHub API thất bại");
  }
}
