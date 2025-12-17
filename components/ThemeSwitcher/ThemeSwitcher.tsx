"use client";

import { useEffect } from "react";
import { themeChange } from "theme-change";

const DAISYUI_THEMES = [
  "acid",
  "aqua",
  "autumn",
  "black",
  "bumblebee",
  "business",
  "cmyk",
  "coffee",
  "corporate",
  "cupcake",
  "cyberpunk",
  "dark",
  "dim",
  "dracula",
  "emerald",
  "fantasy",
  "forest",
  "garden",
  "halloween",
  "lemonade",
  "light",
  "lofi",
  "luxury",
  "night",
  "nord",
  "pastel",
  "retro",
  "sunset",
  "synthwave",
  "valentine",
  "winter",
  "wireframe",
];

export function ThemeSwitcher() {
  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <div className="dropdown dropdown-end fixed top-4 right-4 z-50">
      <button tabIndex={0} className="btn btn-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
          />
        </svg>
      </button>
      <ul className="dropdown-content menu rounded-box bg-primary text-primary-content right-0 grid max-h-96 w-40 grid-cols-1 overflow-y-auto p-2 shadow-lg">
        {DAISYUI_THEMES.map((theme) => (
          <li key={theme}>
            <button
              data-set-theme={theme}
              data-act-class="active"
              className="text-sm whitespace-nowrap"
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
