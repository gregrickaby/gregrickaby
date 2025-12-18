import { DynamicIcon } from "@/components/DynamicIcon";
import { Fragment } from "react";
import type { LinksProps } from "./Links.types";

import { ICON_SIZES } from "@/lib/constants/iconConfig";

export function Links({ links }: Readonly<LinksProps>) {
  return (
    <section className="card card-lg from-base-100 to-base-300 bg-linear-to-r/oklch shadow-xl">
      <div className="card-body">
        <h3 className="mb-2 text-2xl font-semibold text-shadow-xs">Links</h3>
        {links.map((link, index) => (
          <Fragment key={link.url}>
            <a
              className="hover:bg-base-300 -ml-2 flex items-start gap-3 rounded-lg p-2 transition"
              href={link.url}
              rel="noopener noreferrer"
              target="_blank"
            >
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
            </a>
            {index < links.length - 1 && <div className="divider my-2" />}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
