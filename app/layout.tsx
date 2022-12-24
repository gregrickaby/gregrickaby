import { Open_Sans } from "@next/font/google";
import "./global.css";

const font = Open_Sans({ subsets: ["latin"] });

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
      <body className={font.className}>{children}</body>
    </html>
  );
}
