"use client";

import { Terminal } from "@/components/Terminal";
import type { Project } from "@/data/profile";

export function AppShell({ projects }: { projects: Project[] }) {
  return (
    <div className="scanlines">
      <Terminal projects={projects} />
    </div>
  );
}
