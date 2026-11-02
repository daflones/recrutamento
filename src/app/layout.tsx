import type { Metadata } from "next";
import { headers } from "next/headers";
import { JetBrains_Mono, Space_Grotesk, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

const SITE_TITLE = "fsociety.dev // Recrutamento SaaS (3 Vagas)";
const SITE_DESCRIPTION =
  "Recrutamento oficial F.SOCIETY.DEV até 10/11. 3 pessoas serão selecionadas para construir e assumir uma aplicação SaaS real em 30 dias com Mr. Robot. We are not just learning to code. We are learning to build.";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto =
    h.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const rawBase =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (host ? `${proto}://${host}` : "https://fsociety.dev");

  let metadataBase: URL;
  try {
    metadataBase = new URL(rawBase);
  } catch {
    metadataBase = new URL("https://fsociety.dev");
  }

  return {
    metadataBase,
    title: {
      default: SITE_TITLE,
      template: "%s | F.SOCIETY.DEV",
    },
    description: SITE_DESCRIPTION,
    applicationName: "F.SOCIETY.DEV",
    keywords: [
      "fsociety.dev",
      "recrutamento dev",
      "criar saas",
      "programação com ia",
      "mr robot",
      "comunidade programação",
    ],
    authors: [{ name: "Mr. Robot (@daflones_)", url: "https://instagram.com/daflones_" }],
    icons: {
      icon: [{ url: "/favicon.png", type: "image/png", sizes: "128x128" }],
      shortcut: ["/favicon.png"],
      apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: metadataBase.toString(),
      siteName: "F.SOCIETY.DEV — fsociety00.dat",
      title: "🖥️ F.SOCIETY.DEV — Recrutamento Aberto (Apenas 3 Vagas)",
      description:
        "Durante 30 dias, 3 pessoas vão construir uma aplicação SaaS real do zero ao lançamento comigo (Mr. Robot) — e assumir a continuidade do projeto no final. Inscrições até 10/11.",
      images: [
        {
          url: "/images/og-fsociety.jpg",
          width: 1200,
          height: 630,
          alt: "F.SOCIETY.DEV — Recrutamento SaaS 30 Dias (3 Vagas)",
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "🖥️ F.SOCIETY.DEV — Recrutamento SaaS (Apenas 3 Vagas)",
      description:
        "Não vamos apenas estudar programação. Vamos construir um SaaS de verdade em 30 dias. Inscrições abertas até 10/11.",
      images: ["/images/og-fsociety.jpg"],
      creator: "@daflones_",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${shareTechMono.variable} dark`}
    >
      <body className="bg-[#050508] text-zinc-100 antialiased selection:bg-purple-600 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
