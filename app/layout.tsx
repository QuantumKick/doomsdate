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
  metadataBase: new URL("https://elleven-elleven.vercel.app"),
  title: "Brand New Date",
  description: "with great power, comes great responsibility",
  openGraph: {
    title: "Brand New Date",
    description: "with great power, comes great responsibility",
    url: "https://elleven-elleven.vercel.app",
    siteName: "Brand New Date",
    images: [
      {
        url: "/og-image.jpg", // Automatically prepended with metadataBase
        width: 1200,
        height: 630,
        alt: "Brand New Date Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand New Date",
    description: "with great power, comes great responsibility",
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