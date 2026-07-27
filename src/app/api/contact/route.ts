import { NextResponse } from "next/server";
import { z } from "zod";
import { profile } from "@/data/profile";

export const runtime = "nodejs";

const payloadSchema = z.object({
  name: z.string().trim().min(2, "Tên quá ngắn").max(80, "Tên quá dài"),
  email: z.email("Email không hợp lệ").max(160),
  message: z
    .string()
    .trim()
    .min(10, "Tin nhắn cần ít nhất 10 ký tự")
    .max(4000, "Tin nhắn quá dài"),
  /**
   * Bẫy bot: trường này bị ẩn nên người thật luôn để trống.
   * Cố tình nhận mọi giá trị để xử lý im lặng bên dưới, thay vì trả 400 —
   * báo lỗi ở đây chẳng khác gì chỉ cho bot biết cách vượt qua.
   */
  website: z.string().optional(),
});

/**
 * Giới hạn tốc độ đơn giản, lưu trong RAM.
 * Trên serverless mỗi instance có bộ nhớ riêng nên đây chỉ là lớp chặn thô;
 * muốn chặt chẽ hơn thì thay bằng Upstash Redis hoặc Vercel KV.
 */
const RATE_LIMIT = { max: 3, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter(
    (at) => now - at < RATE_LIMIT.windowMs,
  );

  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Dọn các key đã hết hạn để Map không phình mãi.
  if (hits.size > 500) {
    for (const [existing, times] of hits) {
      if (times.every((at) => now - at >= RATE_LIMIT.windowMs)) {
        hits.delete(existing);
      }
    }
  }

  return false;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || "unknown";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 },
    );
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu sai." },
      { status: 400 },
    );
  }

  // Bot điền vào honeypot: giả vờ thành công để không lộ cơ chế chặn.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, delivered: true });
  }

  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      { ok: false, error: "Bạn gửi hơi nhiều rồi, thử lại sau ít phút nhé." },
      { status: 429 },
    );
  }

  const { name, email, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;

  // Chưa cấu hình Resend (thường là lúc chạy local): báo cho client biết
  // để nó hiển thị đường lui bằng mailto thay vì coi như lỗi.
  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      delivered: false,
      reason: "missing-api-key",
    });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM ?? "gitbot.io <onboarding@resend.dev>",
      to: process.env.CONTACT_TO ?? profile.contact.inbox,
      replyTo: email,
      subject: `[gitbot.io] Tin nhắn mới từ ${name}`,
      text: [
        `Tên:   ${name}`,
        `Email: ${email}`,
        "",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend từ chối gửi:", error);
      return NextResponse.json(
        { ok: false, error: "Không gửi được thư, thử lại sau nhé." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error("Lỗi khi gửi thư liên hệ:", error);
    return NextResponse.json(
      { ok: false, error: "Có lỗi phía máy chủ, thử lại sau nhé." },
      { status: 500 },
    );
  }
}
