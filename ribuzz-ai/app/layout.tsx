import type { Metadata } from "next";
import { Saira, Space_Grotesk } from "next/font/google";
import "./globals.css";

const saira = Saira({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-saira",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap"
});

export const metadata: Metadata = {
  title: "RiBuzz AI · Claridad comercial en 15 minutos",
  description:
    "Diagnóstico comercial inteligente: identifica qué está frenando tus ingresos y recibe un playbook accionable.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${saira.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased">
        <div className="cosmos-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
