import "./globals.css";
import Cursor from "@/components/Cursor";
import GlobalBackground from "@/components/GlobalBackground";
import CRTOverlayGate from "@/components/CRTOverlayGate";
import LoadingOverlay from "@/components/LoadingOverlay";
import TypingSoundInit from "@/components/TypingSoundInit";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

export const metadata = {
  title: "Jason Saputra · Product & Interaction Designer",
  description:
    "Bali-born, SF-based product and interaction designer. Looking for internships.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Jason Saputra · Product & Interaction Designer",
    description:
      "Product and interaction design. Looking for internships. Portfolio by Jason Saputra.",
    url: siteUrl,
    siteName: "Jason Saputra",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bonbon&family=DM+Sans:wght@300;400;500;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-text-primary font-body">
        <GlobalBackground />
        <div className="crt-stage">{children}</div>
        <CRTOverlayGate />
        <Cursor />
        <TypingSoundInit />
        <LoadingOverlay />
      </body>
    </html>
  );
}
