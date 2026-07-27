export const THEME_NAMES = [
  "matrix",
  "dracula",
  "nord",
  "amber",
  "synthwave",
] as const;

export type ThemeName = (typeof THEME_NAMES)[number];

export const DEFAULT_THEME: ThemeName = "matrix";

export const THEME_STORAGE_KEY = "gitbot.theme";

export const themes: Record<ThemeName, { label: string; swatch: string }> = {
  matrix: { label: "Matrix — xanh phosphor cổ điển", swatch: "#39ff8b" },
  dracula: { label: "Dracula — tím/cyan dịu mắt", swatch: "#bd93f9" },
  nord: { label: "Nord — xanh lạnh tối giản", swatch: "#88c0d0" },
  amber: { label: "Amber — CRT hổ phách thập niên 80", swatch: "#ffb000" },
  synthwave: { label: "Synthwave — neon hồng/cyan", swatch: "#ff2e97" },
};

export function isThemeName(value: string): value is ThemeName {
  return (THEME_NAMES as readonly string[]).includes(value);
}
