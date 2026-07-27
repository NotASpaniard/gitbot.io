"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { BootSequence } from "@/components/BootSequence";
import { MatrixRain } from "@/components/MatrixRain";
import { Banner } from "@/components/output/Banner";
import { Dim, OutputBlock, SectionTitle } from "@/components/output/primitives";
import { profile, type Project } from "@/data/profile";
import {
  allCommandNames,
  findCommand,
  publicCommandNames,
} from "@/lib/commands";
import { useClientValue } from "@/lib/browser-hooks";
import { closestMatch, commonPrefix } from "@/lib/suggest";
import type { EffectName, HistoryEntry, TerminalApi } from "@/lib/terminal-types";
import {
  DEFAULT_THEME,
  isThemeName,
  THEME_STORAGE_KEY,
  type ThemeName,
} from "@/lib/themes";

const { identity, contact } = profile;

const PROMPT = `${identity.visitor}@${identity.host}:~$`;
const BOOT_FLAG = "gitbot.booted";

const QUICK_COMMANDS = [
  "help",
  "about",
  "projects",
  "skills",
  "social",
  "games",
  "hobbies",
  "contact",
  "neofetch",
];

type ContactStep = "name" | "email" | "message";

type ContactState = {
  step: ContactStep;
  draft: { name: string; email: string; message: string };
};

const CONTACT_PROMPTS: Record<ContactStep, string> = {
  name: "tên bạn >",
  email: "email >",
  message: "nội dung >",
};

/** Kiểm tra ngay ở client để báo lỗi nhanh; server vẫn validate lại. */
function validateStep(step: ContactStep, value: string): string | null {
  if (step === "name") {
    return value.length < 2 ? "Tên cần ít nhất 2 ký tự." : null;
  }
  if (step === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? null
      : "Email trông không hợp lệ.";
  }
  return value.length < 10 ? "Nội dung cần ít nhất 10 ký tự." : null;
}

const readStoredTheme = () => window.localStorage.getItem(THEME_STORAGE_KEY);
const readBootFlag = () => window.sessionStorage.getItem(BOOT_FLAG) !== null;

export function Terminal({ projects }: { projects: Project[] }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [contactState, setContactState] = useState<ContactState | null>(null);
  const [sending, setSending] = useState(false);
  const [effect, setEffect] = useState<EffectName | null>(null);

  // Theme: giá trị đã lưu là mặc định, lệnh `theme` ghi đè trong phiên hiện tại.
  const storedTheme = useClientValue(readStoredTheme, null);
  const [themeOverride, setThemeOverride] = useState<ThemeName | null>(null);
  const theme =
    themeOverride ??
    (storedTheme && isThemeName(storedTheme) ? storedTheme : DEFAULT_THEME);

  // Boot chỉ chạy lần đầu mỗi phiên, tải lại trang trong cùng tab thì bỏ qua.
  const alreadyBooted = useClientValue(readBootFlag, false);
  const [bootFinished, setBootFinished] = useState(false);
  const booting = !alreadyBooted && !bootFinished;

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const activePrompt = contactState ? CONTACT_PROMPTS[contactState.step] : PROMPT;

  // ── Tiện ích in ra terminal ────────────────────────────────────────────
  const pushOutput = useCallback((node: ReactNode) => {
    nextId.current += 1;
    setEntries((prev) => [...prev, { id: nextId.current, kind: "output", node }]);
  }, []);

  const pushInput = useCallback((prompt: string, text: string) => {
    nextId.current += 1;
    setEntries((prev) => [
      ...prev,
      { id: nextId.current, kind: "input", prompt, text },
    ]);
  }, []);

  // ── Theme ──────────────────────────────────────────────────────────────
  const setTheme = useCallback((name: ThemeName) => {
    setThemeOverride(name);
    document.documentElement.dataset.theme = name;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, name);
    } catch {
      // Chế độ riêng tư có thể chặn localStorage — đổi màu vẫn chạy bình thường.
    }
  }, []);

  const finishBoot = useCallback(() => {
    try {
      window.sessionStorage.setItem(BOOT_FLAG, "1");
    } catch {
      // Không lưu được thì cùng lắm boot lại ở lần sau, không ảnh hưởng gì.
    }
    setBootFinished(true);
  }, []);

  // Banner chỉ vẽ một lần lúc mở phiên — `clear` xoá xong không được vẽ lại.
  const bannerShown = useRef(false);
  useEffect(() => {
    if (booting || bannerShown.current) return;
    bannerShown.current = true;
    pushOutput(<Banner />);
    inputRef.current?.focus();
  }, [booting, pushOutput]);

  // ── Luôn cuộn xuống đáy khi nội dung dài ra ────────────────────────────
  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;

    const toBottom = () => {
      scroller.scrollTop = scroller.scrollHeight;
    };

    toBottom();
    // Nội dung còn cao lên trong lúc gõ chữ / ảnh tải xong.
    const observer = new ResizeObserver(toBottom);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [entries]);

  // ── Hiệu ứng ───────────────────────────────────────────────────────────
  const runEffect = useCallback((name: EffectName) => {
    setEffect(name);
    if (name === "crash") window.setTimeout(() => setEffect(null), 900);
  }, []);

  // ── Form liên hệ ───────────────────────────────────────────────────────
  const startContact = useCallback(() => {
    pushOutput(
      <OutputBlock>
        <SectionTitle>contact</SectionTitle>
        <p className="text-term-fg">
          Trả lời ba câu hỏi bên dưới, tin nhắn sẽ tới thẳng hộp thư của mình.
        </p>
        <Dim>
          {contact.note} Gõ &lsquo;cancel&rsquo; hoặc bấm Ctrl+C để huỷ giữa
          chừng.
        </Dim>
      </OutputBlock>,
    );
    setContactState({ step: "name", draft: { name: "", email: "", message: "" } });
  }, [pushOutput]);

  const cancelContact = useCallback(() => {
    setContactState(null);
    pushOutput(
      <OutputBlock>
        <Dim>Đã huỷ. Không có gì được gửi đi.</Dim>
      </OutputBlock>,
    );
  }, [pushOutput]);

  const submitContact = useCallback(
    async (draft: ContactState["draft"]) => {
      setSending(true);
      pushOutput(
        <OutputBlock>
          <Dim>Đang gửi…</Dim>
        </OutputBlock>,
      );

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...draft, website: "" }),
        });
        const result = await response.json();

        if (!response.ok || !result.ok) {
          pushOutput(
            <OutputBlock>
              <p className="text-term-error">
                {result?.error ?? "Không gửi được, thử lại sau nhé."}
              </p>
            </OutputBlock>,
          );
        } else if (result.delivered === false) {
          // Máy chủ chưa cấu hình RESEND_API_KEY — mở đường lui bằng mailto.
          const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(
            `Liên hệ từ ${draft.name}`,
          )}&body=${encodeURIComponent(draft.message)}`;
          pushOutput(
            <OutputBlock>
              <p className="text-term-fg">
                Máy chủ chưa cấu hình dịch vụ gửi mail.
              </p>
              <p>
                <Dim>→ </Dim>
                <a
                  href={mailto}
                  className="text-term-accent2 underline underline-offset-2"
                >
                  Bấm vào đây để gửi bằng ứng dụng mail của bạn
                </a>
              </p>
            </OutputBlock>,
          );
        } else {
          pushOutput(
            <OutputBlock>
              <p className="text-term-accent">
                Đã gửi. Cảm ơn {draft.name} — mình sẽ trả lời sớm.
              </p>
            </OutputBlock>,
          );
        }
      } catch {
        pushOutput(
          <OutputBlock>
            <p className="text-term-error">
              Mất kết nối tới máy chủ. Bạn thử lại hoặc mail thẳng tới{" "}
              {contact.email}.
            </p>
          </OutputBlock>,
        );
      } finally {
        setSending(false);
        setContactState(null);
      }
    },
    [pushOutput],
  );

  // ── Chạy lệnh ──────────────────────────────────────────────────────────
  const api = useMemo<TerminalApi>(
    () => ({
      print: pushOutput,
      clear: () => setEntries([]),
      theme,
      setTheme,
      commandHistory,
      projects,
      startContact,
      runEffect,
    }),
    [
      commandHistory,
      projects,
      pushOutput,
      runEffect,
      setTheme,
      startContact,
      theme,
    ],
  );

  const runCommand = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      pushInput(PROMPT, raw);
      if (!trimmed) return;

      setCommandHistory((prev) => [...prev, trimmed]);

      const [name, ...args] = trimmed.split(/\s+/);
      const command = findCommand(name);

      if (!command) {
        const suggestion = closestMatch(name, publicCommandNames);
        pushOutput(
          <OutputBlock>
            <p className="text-term-error">
              {name}: không có lệnh này.
              {suggestion && (
                <>
                  {" "}
                  Ý bạn là{" "}
                  <span className="text-term-accent2">{suggestion}</span>?
                </>
              )}
            </p>
            <Dim>Gõ &lsquo;help&rsquo; để xem tất cả lệnh.</Dim>
          </OutputBlock>,
        );
        return;
      }

      try {
        const result = await command.run(args, api);
        if (result) pushOutput(result);
      } catch (error) {
        console.error(error);
        pushOutput(
          <OutputBlock>
            <p className="text-term-error">
              {name}: lệnh gặp lỗi khi chạy.
            </p>
          </OutputBlock>,
        );
      }
    },
    [api, pushInput, pushOutput],
  );

  // ── Xử lý khi nhấn Enter ───────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (sending) return;
    const raw = input;
    setInput("");
    setHistoryCursor(null);

    if (!contactState) {
      await runCommand(raw);
      return;
    }

    // Đang trong luồng hỏi-đáp của form liên hệ
    const value = raw.trim();
    pushInput(CONTACT_PROMPTS[contactState.step], raw);

    if (value.toLowerCase() === "cancel") {
      cancelContact();
      return;
    }

    const problem = validateStep(contactState.step, value);
    if (problem) {
      pushOutput(
        <OutputBlock>
          <p className="text-term-error">{problem}</p>
        </OutputBlock>,
      );
      return;
    }

    const draft = { ...contactState.draft, [contactState.step]: value };

    if (contactState.step === "name") {
      setContactState({ step: "email", draft });
    } else if (contactState.step === "email") {
      setContactState({ step: "message", draft });
    } else {
      await submitContact(draft);
    }
  }, [
    cancelContact,
    contactState,
    input,
    pushInput,
    pushOutput,
    runCommand,
    sending,
    submitContact,
  ]);

  // ── Phím tắt ───────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (effect === "matrix") {
        setEffect(null);
        event.preventDefault();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        void handleSubmit();
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        setEntries([]);
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        pushInput(activePrompt, `${input}^C`);
        setInput("");
        if (contactState) cancelContact();
        return;
      }

      if (event.key === "Escape") {
        setInput("");
        return;
      }

      // Lịch sử và autocomplete chỉ có nghĩa ở chế độ gõ lệnh
      if (contactState) return;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!commandHistory.length) return;
        const next =
          historyCursor === null
            ? commandHistory.length - 1
            : Math.max(0, historyCursor - 1);
        setHistoryCursor(next);
        setInput(commandHistory[next]);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (historyCursor === null) return;
        const next = historyCursor + 1;
        if (next >= commandHistory.length) {
          setHistoryCursor(null);
          setInput("");
        } else {
          setHistoryCursor(next);
          setInput(commandHistory[next]);
        }
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        const [word, ...rest] = input.split(/\s+/);
        if (rest.length) return; // chỉ hoàn thành tên lệnh, không hoàn thành tham số

        const matches = allCommandNames.filter((name) =>
          name.startsWith(word.toLowerCase()),
        );
        if (!matches.length) return;

        if (matches.length === 1) {
          setInput(`${matches[0]} `);
          return;
        }

        setInput(commonPrefix(matches));
        pushOutput(
          <OutputBlock>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {matches.map((match) => (
                <span key={match} className="text-term-accent2">
                  {match}
                </span>
              ))}
            </div>
          </OutputBlock>,
        );
      }
    },
    [
      activePrompt,
      cancelContact,
      commandHistory,
      contactState,
      effect,
      handleSubmit,
      historyCursor,
      input,
      pushInput,
      pushOutput,
    ],
  );

  /** Bấm vào vùng trống của terminal thì trả focus về ô nhập. */
  const refocus = useCallback((event: ReactMouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button, input")) return;
    if (window.getSelection()?.toString()) return; // đang bôi đen để copy
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className={`flex h-dvh flex-col p-2 sm:p-4 ${
        effect === "crash" ? "shake" : ""
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-term-border bg-term-panel/70 shadow-2xl backdrop-blur-xs">
        {/* Thanh tiêu đề kiểu cửa sổ terminal */}
        <div className="flex shrink-0 items-center gap-3 border-b border-term-border px-3 py-2">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-term-error/80" />
            <span className="h-3 w-3 rounded-full bg-term-accent2/60" />
            <span className="h-3 w-3 rounded-full bg-term-accent/70" />
          </div>
          <p className="truncate text-xs text-term-dim sm:text-sm">
            {identity.visitor}@{identity.host}: ~
          </p>
        </div>

        {/* Vùng nội dung cuộn được */}
        <div
          ref={scrollRef}
          onClick={refocus}
          className="term-scroll grow overflow-y-auto px-3 py-2 text-sm leading-relaxed sm:px-4 sm:text-[0.9rem]"
        >
          <div ref={contentRef} className="space-y-1">
            {booting && <BootSequence onDone={finishBoot} />}

            <div aria-live="polite" aria-atomic="false" className="space-y-1">
              {entries.map((entry) =>
                entry.kind === "input" ? (
                  <p key={entry.id} className="flex flex-wrap gap-x-2">
                    <span className="text-term-accent">{entry.prompt}</span>
                    <span className="text-term-fg">{entry.text}</span>
                  </p>
                ) : (
                  <div key={entry.id}>{entry.node}</div>
                ),
              )}
            </div>

            {/* Dòng nhập lệnh */}
            {!booting && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSubmit();
                }}
                className="flex items-center gap-2 pt-1"
              >
                <label
                  htmlFor="terminal-input"
                  className="shrink-0 text-term-accent"
                >
                  {activePrompt}
                </label>
                <input
                  id="terminal-input"
                  ref={inputRef}
                  value={input}
                  disabled={sending}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label={
                    contactState
                      ? `Nhập ${CONTACT_PROMPTS[contactState.step]}`
                      : "Nhập lệnh"
                  }
                  className="grow bg-transparent text-term-fg caret-term-accent outline-none disabled:opacity-50"
                />
              </form>
            )}
          </div>
        </div>

        {/* Gợi ý lệnh — chủ yếu để dùng trên điện thoại */}
        {!booting && !contactState && (
          <div className="term-scroll shrink-0 overflow-x-auto border-t border-term-border px-3 py-2">
            <div className="flex w-max gap-2">
              {QUICK_COMMANDS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    void runCommand(name);
                    inputRef.current?.focus();
                  }}
                  className="rounded-sm border border-term-border px-2 py-1 text-xs text-term-dim transition-colors hover:border-term-accent hover:text-term-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-accent"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {effect === "matrix" && <MatrixRain onDone={() => setEffect(null)} />}
    </div>
  );
}
