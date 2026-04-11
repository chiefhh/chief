import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Providers } from "@/components/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Chief.me — The Digital Doorplate for Leaders",
  description:
    "The exclusive personal brand platform for VP-level and above executives. Claim your digital doorplate — free, forever.",
  metadataBase: new URL("https://chief.me"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Chief.me — The Digital Doorplate for Leaders",
    description:
      "The exclusive personal brand platform for VP-level and above executives.",
    url: "https://chief.me",
    siteName: "Chief.me",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chief.me — The Digital Doorplate for Leaders",
    description:
      "The exclusive personal brand platform for VP-level and above executives.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased">
        <Providers>
          <LanguageProvider>{children}</LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
