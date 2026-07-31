import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeyMenu AI - Restaurant Management",
  description: "AI Powered Restaurant Management System",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <LanguageProvider>
          <ReduxProvider>
            {children}
            <Toaster position="top-center" />
          </ReduxProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
