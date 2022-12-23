import { Raleway } from "@next/font/google";
import cx from "classnames";
import styles from "./layout.module.css";

const font = Raleway({ subsets: ["latin"] });

/**
 * The root layout for the app.
 *
 * @see https://beta.nextjs.org/docs/routing/pages-and-layouts#root-layout-required
 * @returns The RootLayout component.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={cx(styles.body, font.className)}>{children}</body>
    </html>
  );
}
