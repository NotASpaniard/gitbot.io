import { profile } from "@/data/profile";
import { Dim, OutputBlock } from "./primitives";

const { identity } = profile;

export function Banner() {
  return (
    <OutputBlock>
      {/* ASCII art rộng 54 cột — cho phép cuộn ngang thay vì xuống dòng vỡ hình */}
      <div className="term-scroll -mx-1 overflow-x-auto px-1">
        <pre
          className="text-glow w-max text-[0.42rem] leading-[1.15] text-term-accent sm:text-[0.6rem] md:text-[0.72rem]"
          aria-label={identity.asciiText}
        >
          {identity.asciiArt}
        </pre>
      </div>

      <div className="space-y-1">
        <p className="text-term-fg">
          {identity.role} <Dim>·</Dim> {identity.location}
        </p>
        <p className="text-term-dim italic">{identity.tagline}</p>
      </div>

      <p className="text-term-dim">
        Gõ{" "}
        <span className="text-term-accent2">
          &lsquo;help&rsquo;
        </span>{" "}
        để xem danh sách lệnh, hoặc{" "}
        <span className="text-term-accent2">&lsquo;neofetch&rsquo;</span> để xem
        nhanh thông tin.
      </p>
    </OutputBlock>
  );
}
