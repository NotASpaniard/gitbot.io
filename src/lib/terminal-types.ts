import type { ReactNode } from "react";
import type { Project } from "@/data/profile";
import type { ProjectSource } from "./github";
import type { ThemeName } from "./themes";

export type EffectName = "matrix" | "crash";

/** Những gì một lệnh được phép làm với terminal đang chạy. */
export type TerminalApi = {
  /** In thêm một khối output (dùng cho lệnh bất đồng bộ). */
  print: (node: ReactNode) => void;
  clear: () => void;
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  /** Lịch sử lệnh đã gõ, cũ → mới. */
  commandHistory: string[];
  /** Dự án đã giải quyết xong nguồn (GitHub hoặc danh sách dự phòng). */
  projects: Project[];
  /** Dữ liệu `projects` cuối cùng lấy từ đâu — hiện dưới danh sách dự án. */
  projectSource: ProjectSource;
  /** Chuyển terminal sang chế độ hỏi-đáp của form liên hệ. */
  startContact: () => void;
  runEffect: (name: EffectName) => void;
};

export type Command = {
  name: string;
  aliases?: string[];
  usage?: string;
  description: string;
  /** Không hiện trong `help` — dành cho easter egg. */
  hidden?: boolean;
  run: (
    args: string[],
    api: TerminalApi,
  ) => ReactNode | void | Promise<ReactNode | void>;
};

export type HistoryEntry =
  | { id: number; kind: "input"; prompt: string; text: string }
  | { id: number; kind: "output"; node: ReactNode };
