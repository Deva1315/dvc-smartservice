import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";

import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "DVC SmartService",
  description: "Sistem informasi penjualan dan servis DVC Komputer",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}