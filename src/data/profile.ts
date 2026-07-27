export type IconName = string;

export type Project = {
  name: string;
  description: string;
  tech: string[];
  repo?: string;
  demo?: string;
  stars?: number;
  year: string;
  featured?: boolean;
  status?: "active" | "archived" | "wip";
};

export type SkillGroup = {
  category: string;
  items: { name: string; level: number }[]; // level: 0–100
};

export type Social = {
  label: string;
  username: string;
  url: string;
  icon: IconName;
};

export type GameAccount = {
  platform: string;
  username: string;
  rank?: string;
  hours?: string;
  icon: IconName;
  url?: string;
};

export type Hobby = {
  label: string;
  icon: IconName;
  note?: string;
};

export const profile = {
  /** Danh tính — hiện ở banner, neofetch, prompt và thẻ meta */
  identity: {
    name: "Cáo",
    handle: "cáo",
    /** Tên tài khoản khách, hiện ở dấu nhắc lệnh: fox@gitbot.io */
    visitor: "fox",
    /** Phần sau dấu @ trong dấu nhắc lệnh */
    host: "gitbot.io",
    role: "On my way to Full-stack Developer",
    location: "Việt Nam",
    timezone: "UTC+7",
    tagline: "Đen đá không đường, code sạch không bug",
    /** Số năm kinh nghiệm, hiện trong neofetch */
    uptime: "4 năm cày đrl",
    /** Chữ mà banner ASCII bên dưới đánh vần — dùng làm nhãn cho trình đọc màn hình */
    asciiText: "Sir Fox",
    asciiArt: String.raw`
███████╗██╗██████╗     ███████╗ ██████╗ ██╗  ██╗
██╔════╝██║██╔══██╗    ██╔════╝██╔═══██╗╚██╗██╔╝
███████╗██║██████╔╝    █████╗  ██║   ██║ ╚███╔╝
╚════██║██║██╔══██╗    ██╔══╝  ██║   ██║ ██╔██╗
███████║██║██║  ██║    ██║     ╚██████╔╝██╔╝ ██╗
╚══════╝╚═╝╚═╝  ╚═╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝`.replace(/^\n/, ""),
    /** Logo nhỏ dùng cho lệnh `neofetch` — cốc cà phê đen đá không đường */
    neofetchLogo: [
      "      ) )",
      "     ( (",
      "      ) )",
      "   .------.",
      "   |      |__",
      "   |      |  |",
      "   |      |__|",
      "   |      |",
      "   '------'",
    ].join("\n"),
  },

  github: {
    login: "NotASpaniard",
    /** Số repo tối đa hiển thị khi lấy tự động */
    limit: 5,
  },

  /** Các đoạn giới thiệu — lệnh `about` gõ ra từng đoạn một */
  about: [
    "Xin chào, mình là Cáo, 1 dev đang tập tành làm bot.",
    "Mình thích cà phê - đặc biệt là đen không đường.",
    "Ngoài giờ làm mình nghịch automation, viết bot, và thỉnh thoảng làm mấy trang linh tinh như cái bạn đang xem.",
    "Muốn có người yapping bên tai để làm việc hiệu quả. Gõ 'contact' nếu muốn nói chuyện.",
  ],

  /** Timeline học vấn / kinh nghiệm — lệnh `experience` */
  experience: [
    {
      period: "2025 — nay",
      title: "Dev",
      org: "ATV",
      detail:
        "Phát triển các công cụ nội bộ, tối ưu hoá quy trình làm việc, và xây dựng các bot tự động hoá.",
    },
    {
      period: "2021 — 2024",
      title: "Hustler",
      org: "HUST",
      detail:
        "1 trong những cổ đông lớn của trường.",
    },
  ],

  projects: [] satisfies Project[],

  skills: [
    {
      category: "Ngôn ngữ",
      items: [
        { name: "TypeScript", level: 90 },
        { name: "JavaScript", level: 90 },
        { name: "Python", level: 70 },
        { name: "Go", level: 55 },
        { name: "SQL", level: 75 },
      ],
    },
    {
      category: "Front-end",
      items: [
        { name: "React / Next.js", level: 90 },
        { name: "Tailwind CSS", level: 85 },
        { name: "Svelte", level: 60 },
      ],
    },
    {
      category: "Back-end & Hạ tầng",
      items: [
        { name: "Node.js", level: 85 },
        { name: "PostgreSQL", level: 75 },
        { name: "Docker", level: 65 },
        { name: "Vercel / CI-CD", level: 80 },
      ],
    },
  ] satisfies SkillGroup[],

  socials: [
    {
      label: "GitHub",
      username: "@NotASpaniard",
      url: "https://github.com/NotASpaniard",
      icon: "github",
    },
    {
      label: "Discord",
      username: "midnightdepressio",
      url: "326514371876356097",
      icon: "discord",
    },
    {
      label: "Facebook",
      username: "Coldbrew Mơ",
      url: "https://www.facebook.com/coldbrew909",
      icon: "facebook",
    },
    {
      label: "Email",
      username: "dungpro909",
      url: "mailto:dungpro909@gmail.com",
      icon: "email",
    },
  ] satisfies Social[],

  games: [
    {
      platform: "Steam",
      username: "Parrot",
      hours: "> 100 giờ",
      icon: "steam",
      url: "https://steamcommunity.com/profiles/76561198964587657/",
    },
    {
      platform: "Valorant",
      username: "MâyKínThànhĐô#PDP",
      rank: "Còn chưa đủ lv bắn rank nữa",
      icon: "valorant",
    },
    {
      platform: "League of Legends",
      username: "MâyKínThànhĐô#PDP",
      rank: "Sống chếc với aram",
      icon: "riot",
    },
    {
      platform: "Wuthering Waves",
      username: "Sihoultte",
      icon: "gamepad",
    },
  ] satisfies GameAccount[],

  hobbies: [
    { label: "Chơi game", icon: "gamepad", note: "Mostly Roblox, sometimes Aram, with a bit of Wuwa" },
    { label: "Nghe nhạc", icon: "music", note: "Hay là nghe - Dạo này, Đại Khải Hoàn, Tame impala, KDA, ...." },
    { label: "Đọc sách", icon: "book", note: "Manhua, Manhwa" },
    { label: "Cà phê", icon: "coffee", note: "Đen đá không đường" },
    { label: "Workout", icon: "dumbbell", note: "Thể dục thể thao nâng cao sức đề kháng" },
    { label: "Workdate", icon: "users", note: "Chưa có ai để rủ" },
    { label: "Code", icon: "code", note: "Tạo bot lạ cuối tuần" },
  ] satisfies Hobby[],

  contact: {
    email: "dungpro909@gmail.com",
    discord: "midnightdepressio",
    /** Hiện ở đầu form liên hệ */
    note: "Thường trả lời trong vòng 1–2 ngày.",
    /** Nơi nhận thư khi cấu hình RESEND_API_KEY (xem src/app/api/contact/route.ts) */
    inbox: "dungpro909@gmail.com",
  },

  seo: {
    /**
     * Tên miền thật của trang. Dùng cho metadataBase và thẻ Open Graph, tức là
     * thứ Facebook/Discord đọc khi ai đó dán link. Mua tên miền riêng thì đổi
     * dòng này, không phải sửa chỗ nào khác.
     */
    siteUrl: "https://gitbot-io.vercel.app",
    keywords: [
      "portfolio",
      "developer",
      "terminal",
      "full-stack",
      "Next.js",
      "Việt Nam",
    ],
  },
};

export type Profile = typeof profile;
