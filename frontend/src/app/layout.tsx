import type { Metadata } from "next";
import Script from "next/script";
import { Orbitron, Space_Grotesk, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "CODE MEET 2026 | #24hrs_Hackathon - Srinivas University",
  description:
    "Official Hackathon Website for CODEMEET 2026 presented by SUIET Mukka in collaboration with Webflow Community. Prize Pool RS 50,000.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${syne.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050507] text-neutral-100 font-sans selection:bg-[#d4ff00] selection:text-black overflow-x-hidden">
        {children}
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}


