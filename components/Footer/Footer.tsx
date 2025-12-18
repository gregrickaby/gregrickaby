"use client";

import { DynamicIcon } from "@/components/DynamicIcon";
import type { ProfileData } from "@/lib/domain/models/profileSchema";

export function Footer(data: Readonly<ProfileData>) {
  return (
    <footer className="flex flex-col items-center justify-center gap-3 pt-8 text-center text-white">
      <p className="text-sm">
        &copy; 1997-{new Date().getFullYear()} {data.profile.name}
      </p>

      <a
        aria-label="View this site's JSON data"
        className="inline-flex items-center justify-center"
        href="/data.json"
      >
        <DynamicIcon name="BsFiletypeJson" />
      </a>
    </footer>
  );
}
