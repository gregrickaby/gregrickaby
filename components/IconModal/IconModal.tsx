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
        className="btn btn-outline btn-primary"
        onClick={() => {
          modalRef.current?.showModal();
        }}
        aria-haspopup="dialog"
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
              className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2"
              aria-label="Close modal"
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
                key={item.url}
                className="flex items-start gap-3 rounded-lg p-3"
              >
                <DynamicIcon
                  name={item.icon}
                  size={ICON_SIZES.default}
                  className="mt-1"
                />
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <a
                    className="hover:link text-sm"
                    href={item.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`${item.name}: ${item.url}`}
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
          <button aria-label="Close modal">close</button>
        </form>
      </dialog>
    </>
  );
}
