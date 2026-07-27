"use client";

import { Terminal } from "@/components/Terminal";
import type { Project } from "@/data/profile";
import type { ProjectSource } from "@/lib/github";

export function AppShell({
  projects,
  projectSource,
}: {
  projects: Project[];
  projectSource: ProjectSource;
}) {
  return (
    <div className="scanlines">
      <Terminal projects={projects} projectSource={projectSource} />
    </div>
  );
}
