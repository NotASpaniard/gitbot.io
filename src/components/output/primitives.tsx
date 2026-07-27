import type { ReactNode } from "react";

/** Link ra ngoài, có gạch chân mờ và focus ring rõ ràng. */
export function TermLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-term-accent2 underline decoration-term-border underline-offset-2 transition-colors hover:decoration-current focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-accent"
    >
      {children}
    </a>
  );
}

/** Tiêu đề nhóm, kiểu `── skills ──────────` */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-term-accent">
      <span aria-hidden>──</span>
      <span className="text-glow font-semibold tracking-wide uppercase">
        {children}
      </span>
      <span aria-hidden className="h-px grow bg-term-border" />
    </div>
  );
}

export function Dim({ children }: { children: ReactNode }) {
  return <span className="text-term-dim">{children}</span>;
}

/** Bọc mỗi kết quả lệnh, tạo khoảng cách đều và hiệu ứng hiện dần. */
export function OutputBlock({ children }: { children: ReactNode }) {
  return <div className="reveal space-y-3 py-1">{children}</div>;
}

/** Thẻ nhỏ hiển thị công nghệ, trạng thái... */
export function Tag({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "danger";
}) {
  const tones = {
    default: "border-term-border text-term-dim",
    accent: "border-term-accent/40 text-term-accent",
    danger: "border-term-error/40 text-term-error",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-px text-[0.7rem] leading-4 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
