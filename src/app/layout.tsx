import type { Metadata } from "next";
import { Amiri, Great_Vibes, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Wedding of Muis & Ocha",
  description:
    "Undangan pernikahan Muis & Ocha — Selasa, 16 Maret 2026. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "The Wedding of Muis & Ocha",
    description:
      "Selasa, 16 Maret 2026 — Buka undangan untuk melihat detail acara.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${greatVibes.variable} ${amiri.variable} antialiased bg-[#060F2C] text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
