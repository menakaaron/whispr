import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/providers";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "WhisprAI",
  description:
    "Turn everyday conversations into a personalized coach for language and culture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
