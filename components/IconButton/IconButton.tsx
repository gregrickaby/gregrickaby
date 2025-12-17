import { DynamicIcon } from "@/components/DynamicIcon";
import type { IconButtonProps } from "./IconButton.types";

export function IconButton({ name, url, icon }: Readonly<IconButtonProps>) {
  return (
    <a
      aria-label={name}
      className="btn btn-circle"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <DynamicIcon name={icon} />
    </a>
  );
}
