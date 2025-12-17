"use client";

import { useRef } from "react";
import { DynamicIcon } from "@/components/DynamicIcon";
import type { IconModalProps } from "./IconModal.types";

export function IconModal({
  items,
  buttonText,
  modalTitle,
}: Readonly<IconModalProps>) {
  const modalRef = useRef<HTMLDialogElement>(null);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <button
        className="btn btn-soft btn-wide flex-1"
        onClick={() => {
          modalRef.current?.showModal();
        }}
      >
        {buttonText}
      </button>

      <dialog className="modal" ref={modalRef}>
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2">
              ✕
            </button>
          </form>
          <h3 className="mb-4 text-lg font-bold">{modalTitle}</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.url}
                className="flex items-center gap-3 rounded-lg p-3"
              >
                <DynamicIcon name={item.icon} size={24} />
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <a
                    className="link text-sm"
                    href={item.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {item.url.replace("https://", "").replace("mailto:", "")}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form className="modal-backdrop" method="dialog">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
