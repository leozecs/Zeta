import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zeta | Seu próximo negócio começa com uma conversa",
    template: "%s | Zeta",
  },
  description:
    "Zeta transforma contexto de negócio em site, CRM e sistema web personalizado.",
  applicationName: "Zeta",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
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
