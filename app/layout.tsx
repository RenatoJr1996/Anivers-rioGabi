import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Aniversário Gabriela",
  description: "Convite de aniversário com confirmação de presença.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
