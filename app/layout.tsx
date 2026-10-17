import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css"; 

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://doomsdate-ten.vercel.app"),
  title: "doomsdate",
  description: "That appears... Untrue",
  openGraph: {
    title: "Doomsdate",
    description: "That appears... Untrue",
    url: "https://doomsdate-ten.vercel.app",
    siteName: "Doomsdate",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Doomsdate Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doomsdate",
    description: "That appears... Untrue",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ overscrollBehaviorX: "none" }}
      >
        {children}
      </body>
    </html>
  );
}