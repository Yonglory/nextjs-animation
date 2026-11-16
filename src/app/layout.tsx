import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "@/styles/globals.scss";

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fluffy Hugs — a motion study",
  description:
    "A single-page animation landing page: preloader, hero and collection, built with Next.js, SCSS, GSAP and Lenis.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#dcefff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `is-loading` locks scroll until the preloader finishes (removed in Experience).
    <html lang="en" className={`${display.variable} ${body.variable} is-loading`}>
      <head>
        {/* Without JS there is nothing to wait for: unlock scroll and hide the preloader. */}
        <noscript>
          <style>{`html.is-loading{overflow:auto!important}[data-preloader]{display:none!important}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
