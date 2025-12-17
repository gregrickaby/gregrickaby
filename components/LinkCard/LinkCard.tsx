import type { LinkCardProps } from "./LinkCard.types";

export function LinkCard({ link }: Readonly<LinkCardProps>) {
  return (
    <a
      className="btn btn-soft btn-block h-auto min-h-14 flex-col items-center justify-center gap-1 py-3 text-center whitespace-normal"
      href={link.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="text-base font-semibold">{link.title}</span>
      {link.description && (
        <span className="text-xs font-normal opacity-80">
          {link.description}
        </span>
      )}
    </a>
  );
}
