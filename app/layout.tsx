import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מעלית שבת",
  description: "תצוגת מצב מעליות שבת חיה",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "מעלית שבת",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
