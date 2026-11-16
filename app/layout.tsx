import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assemble Technologies | ERP, web and mobile apps",
  description:
    "Assemble Technologies designs, builds and runs ERP systems, web platforms, mobile apps, cloud infrastructure and automation for growing businesses.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,500..900&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap"
          precedence="default"
        />
        {children}
      </body>
    </html>
  );
}
