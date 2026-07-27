import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import { DEFAULT_THEME, THEME_NAMES, THEME_STORAGE_KEY } from "@/lib/themes";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const { identity, seo } = profile;

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: `${identity.name} — ${identity.role}`,
  description: identity.tagline,
  keywords: seo.keywords,
  authors: [{ name: identity.name, url: seo.siteUrl }],
  openGraph: {
    type: "website",
    url: seo.siteUrl,
    siteName: identity.host,
    title: `${identity.name} — ${identity.role}`,
    description: identity.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${identity.name} — ${identity.role}`,
    description: identity.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: "#030806",
};

/**
 * Đặt data-theme trước khi React hydrate để tránh nháy màu khi tải trang.
 * Chạy đồng bộ trong <head>, nên không thể dùng state của React ở đây.
 */
const themeBootstrap = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var ok=${JSON.stringify(THEME_NAMES)};document.documentElement.dataset.theme=ok.indexOf(t)>-1?t:${JSON.stringify(
  DEFAULT_THEME,
)};}catch(e){document.documentElement.dataset.theme=${JSON.stringify(
  DEFAULT_THEME,
)};}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-theme={DEFAULT_THEME}
      className={`${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
