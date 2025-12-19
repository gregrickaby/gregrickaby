"use client";

import { DynamicIcon } from "@/components/DynamicIcon";
import { ICON_SIZES } from "@/lib/constants/iconConfig";
import { useRef } from "react";
import type { IconModalProps } from "./IconModal.types";

export function IconModal({
  items,
  buttonText,
  modalTitle,
}: Readonly<IconModalProps>) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const titleId = `modal-${modalTitle.toLowerCase().replaceAll(" ", "-")}`;

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        data-umami-event={`open-${modalTitle.toLowerCase().replaceAll(" ", "-")}-modal`}
        className="btn btn-outline btn-primary"
        onClick={() => {
          modalRef.current?.showModal();
        }}
      >
        {buttonText}
      </button>

      <dialog
        className="modal"
        ref={modalRef}
        aria-labelledby={titleId}
        aria-modal="true"
      >
        <div className="modal-box">
          <form method="dialog">
            <button
              aria-label="Close modal"
              className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2"
              data-umami-event={`close-${modalTitle.toLowerCase().replaceAll(" ", "-")}-modal`}
            >
              ✕
            </button>
          </form>
          <h3 id={titleId} className="mb-4 text-lg font-bold">
            {modalTitle}
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                className="flex items-start gap-3 rounded-lg p-3"
                key={item.url}
              >
                <DynamicIcon
                  className="mt-1"
                  name={item.icon}
                  size={ICON_SIZES.default}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <a
                    aria-label={`${item.name}: ${item.url}`}
                    className="hover:link text-sm"
                    data-umami-event={`click-${modalTitle.toLowerCase()}-${item.name.toLowerCase().replaceAll(" ", "-")}`}
                    href={item.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {item.url
                      .replace("https://", "")
                      .replace("mailto:", "")
                      .replace("tel:", "")}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form className="modal-backdrop" method="dialog">
          <button
            aria-label="Close modal"
            data-umami-event={`close-${modalTitle.toLowerCase().replaceAll(" ", "-")}-modal-backdrop`}
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}
