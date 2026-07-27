import type { ComponentType } from "react";
import {
  FaBookOpen,
  FaCamera,
  FaCode,
  FaDiscord,
  FaDumbbell,
  FaEnvelope,
  FaFacebook,
  FaGamepad,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaMugHot,
  FaMusic,
  FaPersonRunning,
  FaPlane,
  FaSteam,
  FaTelegram,
  FaTerminal,
  FaUsers,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { SiRiotgames, SiValorant } from "react-icons/si";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/**
 * Tên icon dùng trong src/data/profile.ts ánh xạ sang component thật.
 * Tên không có trong bảng này sẽ rơi về `fallback` thay vì làm vỡ trang.
 */
const registry: Record<string, IconComponent> = {
  // Mạng xã hội
  github: FaGithub,
  linkedin: FaLinkedin,
  x: FaXTwitter,
  twitter: FaXTwitter,
  facebook: FaFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
  telegram: FaTelegram,
  email: FaEnvelope,

  // Game
  steam: FaSteam,
  discord: FaDiscord,
  valorant: SiValorant,
  riot: SiRiotgames,
  gamepad: FaGamepad,

  // Sở thích
  music: FaMusic,
  camera: FaCamera,
  book: FaBookOpen,
  coffee: FaMugHot,
  running: FaPersonRunning,
  dumbbell: FaDumbbell,
  users: FaUsers,
  plane: FaPlane,
  code: FaCode,
};

const fallback: IconComponent = FaTerminal;

export function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: string;
  className?: string;
}) {
  const Component = registry[name] ?? fallback;
  return <Component className={className} aria-hidden />;
}
