import { DynamicIcon } from "@/components/DynamicIcon";
import Link from "next/link";
import { Fragment } from "react";
import type { LinksProps } from "./Links.types";

import { ICON_SIZES } from "@/lib/constants/iconConfig";

export function Links({ links }: Readonly<LinksProps>) {
  return (
    <section className="card card-lg from-base-100 to-base-300 bg-linear-to-r/oklch shadow-xl">
      <div className="card-body">
        <h3 className="mb-2 text-2xl font-semibold text-shadow-xs">Links</h3>
        {links.map((link, index) => {
          const isExternal =
            link.url.startsWith("http://") || link.url.startsWith("https://");
          const linkContent = (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-1 font-medium">
                  {link.title}
                  <DynamicIcon
                    name="RxOpenInNewWindow"
                    size={ICON_SIZES.xsmall}
                  />
                </div>
                <p className="text-base-content/70 text-sm">
                  {link.description}
                </p>
              </div>
            </>
          );

          return (
            <Fragment key={link.url}>
              {isExternal ? (
                <a
                  className="hover:bg-base-300 -ml-2 flex items-start gap-3 rounded-lg p-2 transition"
                  data-umami-event={`click-link-${link.title.toLowerCase().replaceAll(" ", "-")}`}
                  href={link.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {linkContent}
                </a>
              ) : (
                <Link
                  className="hover:bg-base-300 -ml-2 flex items-start gap-3 rounded-lg p-2 transition"
                  data-umami-event={`click-link-${link.title.toLowerCase().replaceAll(" ", "-")}`}
                  href={link.url}
                >
                  {linkContent}
                </Link>
              )}
              {index < links.length - 1 && <div className="divider my-2" />}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
