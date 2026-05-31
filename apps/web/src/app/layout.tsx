import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valenix",
  description: "A low-friction AI chat product"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
