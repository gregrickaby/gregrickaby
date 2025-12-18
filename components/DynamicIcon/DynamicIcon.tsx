import { DEFAULT_ICON_SIZE } from "@/lib/constants/iconConfig";
import { getIcon } from "@/lib/utils/iconResolver";
import { createElement } from "react";
import type { DynamicIconProps } from "./DynamicIcon.types";

export function DynamicIcon({
  name,
  size = DEFAULT_ICON_SIZE,
  className = "",
  "aria-label": ariaLabel,
}: Readonly<DynamicIconProps>) {
  const Icon = getIcon(name);

  if (!Icon) {
    return null;
  }

  return createElement(Icon, {
    size,
    className,
    "aria-label": ariaLabel,
    "aria-hidden": ariaLabel ? undefined : true,
  });
}
