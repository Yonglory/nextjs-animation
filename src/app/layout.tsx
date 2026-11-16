import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "@/styles/globals.scss";

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Fluffy Hugs",
  description: "A single-page animation landing page built with Next.js, SCSS, GSAP and Lenis.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#dcefff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} is-loading`}>
      <head>
        <noscript>
          <style>{`html.is-loading{overflow:auto!important}[data-preloader]{display:none!important}`}</style>
        </noscript>
      </head>
      {/* Browser extensions inject attributes into <body> before hydration. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
