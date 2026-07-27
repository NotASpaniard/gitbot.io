# gitbot.io

Trang bio cá nhân dạng **terminal tương tác**. Khách truy cập gõ lệnh (`help`,
`projects`, `contact`…) để khám phá nội dung. Trên điện thoại có sẵn thanh nút
gợi ý ở đáy màn hình nên không cần gõ.

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · triển khai trên Vercel.

---

## Chạy thử

```bash
npm install
npm run dev      # http://localhost:3005
```

Các lệnh khác:

```bash
npm run build    # build production, đồng thời kiểm tra kiểu dữ liệu
npm run start    # chạy bản production đã build (cũng ở cổng 3005)
npm run lint     # ESLint
```

> Cổng 3005 được đặt cứng trong `package.json` vì 3000 đang bận. Muốn đổi thì
> sửa cờ `-p` ở hai script `dev` và `start`.

---

## Cập nhật nội dung

**Toàn bộ nội dung nằm trong [`src/data/profile.ts`](src/data/profile.ts).**
Đây là chỗ duy nhất cần sửa — mọi component đều đọc từ file này.

| Trường | Hiện ở đâu |
|---|---|
| `identity` | Banner, `whoami`, `neofetch`, thẻ meta, tiêu đề trang |
| `identity.asciiArt` | Chữ lớn ở banner ([tạo tại đây](https://patorjk.com/software/taag/), font *ANSI Shadow*) |
| `about` | Lệnh `about` |
| `experience` | Lệnh `experience` |
| `github` | Tài khoản dùng để lấy repo tự động (xem mục bên dưới) |
| `projects` | Danh sách **dự phòng** khi không lấy được dữ liệu từ GitHub |
| `skills` | Lệnh `skills` |
| `socials` | Lệnh `social` |
| `games` | Lệnh `games` |
| `hobbies` | Lệnh `hobbies` |
| `contact` | Lệnh `contact`, `email` và API gửi thư |
| `seo` | Thẻ meta, Open Graph |

Tên icon (`icon: "github"`, `icon: "steam"`…) lấy từ bảng trong
[`src/lib/icons.tsx`](src/lib/icons.tsx). Ghi sai tên thì trang vẫn chạy, chỉ
hiển thị icon mặc định — muốn thêm icon mới thì import từ `react-icons` rồi
thêm một dòng vào bảng đó.

---

## Dự án lấy tự động từ GitHub

Phần `projects` không cần khai báo tay. [`src/lib/github.ts`](src/lib/github.ts)
thử lần lượt ba nguồn, dùng được cái nào thì dừng ở cái đó:

| Thứ tự | Nguồn | Điều kiện |
|---|---|---|
| 1 | **Repo đã ghim** (pinned) | có `GITHUB_TOKEN` |
| 2 | **Repo nhiều sao nhất** | chỉ cần `github.login` trong `profile.ts` |
| 3 | Mảng `projects` khai báo tay | hai cách trên đều hỏng |

Vì sao cần token cho repo ghim: GitHub chỉ trả danh sách pinned qua **GraphQL
API**, mà GraphQL bắt buộc xác thực kể cả khi đọc dữ liệu công khai. REST API
(không cần token) thì lại không có endpoint nào cho pinned.

Token chỉ cần quyền đọc dữ liệu công khai — fine-grained token không tick scope
nào, hoặc classic token với `read:user`. Việc gọi API chạy phía máy chủ nên
token không lộ ra trình duyệt, và kết quả được cache 1 tiếng
(`REVALIDATE_SECONDS`) để không chạm trần rate limit.

Lệnh `projects` in kèm một dòng mờ cho biết dữ liệu đang lấy từ nguồn nào.

> Mô tả repo hiển thị trên trang chính là description trên GitHub. Repo nào bỏ
> trống sẽ hiện "Chưa có mô tả." — điền description bên GitHub là trang tự cập
> nhật theo.

---

## Thêm lệnh mới

Mở [`src/lib/commands.tsx`](src/lib/commands.tsx) và thêm một phần tử vào mảng
`commands`:

```tsx
{
  name: "blog",
  aliases: ["posts"],
  usage: "blog [số bài]",
  description: "Danh sách bài viết gần đây",
  run: (args, api) => <BlogList limit={Number(args[0]) || 5} />,
}
```

Bảng `help` sinh trực tiếp từ mảng này nên không cần cập nhật thủ công. Đặt
`hidden: true` để lệnh không xuất hiện trong `help` (dùng cho easter egg).

Đối tượng `api` truyền vào `run` cho phép lệnh in thêm output, xoá màn hình,
đổi theme, mở form liên hệ hoặc bật hiệu ứng — xem
[`src/lib/terminal-types.ts`](src/lib/terminal-types.ts).

---

## Bảng màu

Năm theme định nghĩa bằng CSS custom properties trong
[`src/app/globals.css`](src/app/globals.css): `matrix`, `dracula`, `nord`,
`amber`, `synthwave`. Người xem đổi bằng lệnh `theme <tên>`, lựa chọn được lưu
vào `localStorage`.

Thêm theme mới: thêm một khối `[data-theme="tên"]` trong `globals.css`, rồi
thêm tên đó vào `THEME_NAMES` trong [`src/lib/themes.ts`](src/lib/themes.ts).

---

## Form liên hệ

`POST /api/contact` nhận `{ name, email, message }`, kiểm tra bằng zod, có bẫy
bot (honeypot) và giới hạn 3 lượt / 10 phút cho mỗi IP.

- **Có `RESEND_API_KEY`** → gửi thư thật qua [Resend](https://resend.com),
  `replyTo` đặt bằng email người gửi để bấm Trả lời là xong.
- **Không có** → API trả về `delivered: false`, terminal tự hiện link `mailto:`
  để khách gửi bằng ứng dụng mail của họ. Nhờ vậy chạy local vẫn dùng được.

Sao chép `.env.example` thành `.env.local` rồi điền khoá nếu muốn gửi thư thật.

> Giới hạn tốc độ lưu trong RAM nên mỗi instance serverless đếm riêng — đủ chặn
> spam thô. Cần chặt hơn thì thay bằng Vercel KV hoặc Upstash Redis.

---

## Triển khai lên Vercel

1. Đẩy repo lên GitHub.
2. Vào [vercel.com/new](https://vercel.com/new), import repo — Vercel tự nhận
   diện Next.js, không cần cấu hình gì thêm.
3. Trong **Settings → Environment Variables**, thêm `RESEND_API_KEY`,
   `CONTACT_FROM`, `CONTACT_TO` nếu muốn dùng form liên hệ.
4. Đổi `seo.siteUrl` trong `src/data/profile.ts` thành tên miền thật.

---

## Phím tắt trong terminal

| Phím | Tác dụng |
|---|---|
| `Enter` | Chạy lệnh |
| `↑` / `↓` | Duyệt lịch sử lệnh |
| `Tab` | Tự hoàn thành tên lệnh |
| `Ctrl+L` | Xoá màn hình |
| `Ctrl+C` | Huỷ dòng đang gõ / thoát form liên hệ |
| `Esc` | Xoá nội dung đang nhập |

Bật "giảm chuyển động" trong hệ điều hành sẽ tắt hiệu ứng gõ chữ, scanline và
màn khởi động.
