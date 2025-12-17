import { createElement } from "react";
import { getIcon } from "@/lib/utils/iconResolver";
import type { DynamicIconProps } from "./DynamicIcon.types";

export function DynamicIcon({
  name,
  size = 24,
  className = "",
}: Readonly<DynamicIconProps>) {
  const Icon = getIcon(name);

  if (!Icon) {
    return null;
  }

  return createElement(Icon, { size, className });
}
